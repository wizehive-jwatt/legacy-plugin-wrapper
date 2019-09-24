import '@babel/polyfill'
import Client from '@zenginehq/post-rpc-client'

var plugin = {}

const client = new Client(document.location.ancestorOrigins[0])
client.start()

/**
 * Wizehive controller
 *
 * Copyright (c) WizeHive - http://www.wizehive.com
 *
 * @since 0.x.x
 */
;(function (plugin) {
  var _controllers = {}
  let _context = null

  plugin.client = client

  plugin.controller = function (name, locals) {
    if (locals) {
      if (name in _controllers) {
        throw new Error('Duplicate Controller name: ' + name)
      }

      _controllers[name] = locals
      angular.module('wizehive').controller(name, locals)

      return plugin
    } else {
      return _controllers[name]
    }
  }

  plugin.directive = function (name, locals) {
    angular.module('wizehive').directive(name, locals)
    return plugin
  }

  plugin.service = function (name, locals) {
    angular.module('wizehive').service(name, locals)
    return plugin
  }

  plugin.filter = function (name, locals) {
    angular.module('wizehive').filter(name, locals)
    return plugin
  }

  plugin.constant = function (name, locals) {
    angular.module('wizehive').constant(name, locals)
    return plugin
  }

  plugin.factory = function (name, locals) {
    angular.module('wizehive').factory(name, locals)
    return plugin
  }

  plugin.register = async function (pluginName, settings) {
    if (!angular.isObject(settings)) {
      throw new Error('Plugin registration settings must be an object')
    }

    _context = await client.call({ method: 'context' })

    const currentInterface = (settings.interfaces &&
      settings.interfaces.find(iface => _context.pluginView && iface && iface.type === _context.pluginView.type)) || settings

    if (!currentInterface || !currentInterface.template || !currentInterface.controller) {
      throw new Error('Unable to identify plugin interface')
    }

    plugin.compileProvider.directive('plugin', ['$rootScope', function ($rootScope) {
      return {
        restrict: 'A',
        scope: {},
        link: function () {
          angular.forEach(_context, (value, key) => {
            $rootScope[key] = value
          })
        },
        controller: currentInterface.controller,
        templateUrl: currentInterface.template
      }
    }])

    // Code inspired by: https://code.angularjs.org/1.2.21/docs/api/ng/function/angular.injector
    const pluginDiv = angular.element('<div plugin></div>')

    angular.element(document.body).append(pluginDiv)

    angular.element(document).injector().invoke(function ($compile) {
      var scope = angular.element(pluginDiv).scope()

      $compile(pluginDiv)(scope)
    })

    return plugin
  }

  angular.module('wizehive', [
    // 'ngSanitize',
    // 'ngGrid',
    // 'ng-showdown',
    // 'angularjs-dropdown-multiselect',
    // 'ui.select2',
    'ui.select',
    // 'ui.ace',
    'ui.sortable',
    'ui.bootstrap',
    'ui.tinymce',
    'firebase'
  ])
    .config(['$compileProvider', function ($compileProvider) {
      plugin.compileProvider = $compileProvider
    }])
    .service('znData', [function () {
      return function znData (resourceName) {
        function shipItViaPostMessage (params, body, optionalCB) {
          // return client.call(resourceName, params, body, optionalCB)
        }

        return {
          get: shipItViaPostMessage,
          post: shipItViaPostMessage,
          put: shipItViaPostMessage,
          save: shipItViaPostMessage,
          query: shipItViaPostMessage,
          otherMethodsMaybe: shipItViaPostMessage
        }
      }
    }])
    .service('znMessage', [function () {
      console.log('zn message')
      return function (msg, type, duration) {
        return client.call({ method: 'znMessage', args: { msg, type, duration } })
      }
    }])
    .service('znWindow', ['$window', function ($window) {
      var znWindow = this

      // Pass through open method
      znWindow.open = function (strUrl, strWindowName, strWindowFeatures) {
        strWindowName = strWindowName || null
        strWindowFeatures = strWindowFeatures || null

        return $window.open(strUrl, strWindowName, strWindowFeatures)
      }

      znWindow.location = {
        reload: function (force) {
          return client.call({ method: 'location', args: { method: 'reload', args: [] } })
        }
      }
    }])
    .service('$routeParams', [function () {
      return angular.extend({}, _context.location.pathParams, _context.location.searchParams)
    }])
    .service('$location', [function () {
      const znLocation = _context.location
      const locationAsync = (method, args) => {
        args = args || []
        return client.call({ method: 'location', args: { method, args } })
      }

      return {
        host: () => { return znLocation.host },
        protocol: () => { return znLocation.protocol },
        port: () => { return znLocation.port },
        absUrl: () => { return znLocation.href },
        hash: (...args) => {
          if (args.length) {
            locationAsync('hash', args)
          } else {
            return znLocation.hash
          }
        },
        search: (...args) => {
          if (args.length) {
            locationAsync('searchParams', args)
          } else {
            return znLocation.searchParams
          }
        },
        url: (...args) => {
          if (args.length) {
            locationAsync('navigate', args)
          } else {
            var index = znLocation.href.indexOf(znLocation.pathname)
            return znLocation.href.substr(index, znLocation.href.length)
          }
        },
        path: (...args) => {
          if (args.length) {
            locationAsync('navigate', args)
          } else {
            return znLocation.pathname
          }
        }
      }
    }])
})(plugin)

export default plugin
