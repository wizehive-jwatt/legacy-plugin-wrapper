var plugin = {};

import '@babel/polyfill';
import Client from '@zenginehq/post-rpc-client';

const client = new Client(document.location.ancestorOrigins[0]);
client.start();

/**
 * Wizehive controller
 *
 * Copyright (c) WizeHive - http://www.wizehive.com
 *
 * @since 0.x.x
 */
;(function (plugin) {
  var _controllers = {};

  plugin.controller = function (name, locals) {
    if (locals) {
      if (name in _controllers) {
        throw "Duplicate Controller name: " + name;
      }

      _controllers[name] = locals;
      angular.module('wizehive').controller(name, locals);

      return plugin;
    } else {
      return _controllers[name];
    }
  };

  plugin.directive = function (name, locals) {
    angular.module('wizehive').directive(name, locals);
    return plugin;
  };

  plugin.service = function (name, locals) {
    angular.module('wizehive').service(name, locals);
    return plugin;
  };

  plugin.register = async function (pluginName, settings) {
    if (!angular.isObject(settings)) {
      throw new Error('Plugin registration settings must be an object')
    }

    const data = await client.call('context', null, null, 60000);

    const currentInterface = settings.interfaces &&
      settings.interfaces.find(iface => data.pluginView && iface && iface.type === data.pluginView.type);

    if (!currentInterface) {
      throw new Error('Unable to identify plugin interface')
    }

    plugin.compileProvider.directive('plugin', function () {
      return {
        restrict: 'A',
        scope: {},
        controller: currentInterface.controller,
        templateUrl: currentInterface.template
      }
    })

    // Code inspired by: https://code.angularjs.org/1.2.21/docs/api/ng/function/angular.injector
    const pluginDiv = angular.element('<div plugin></div>');

    angular.element(document.body).append(pluginDiv);

    angular.element(document).injector().invoke(function ($compile) {
      var scope = angular.element(pluginDiv).scope();

      $compile(pluginDiv)(scope);
    });

    return plugin
  }

  angular.module('wizehive', [
    // 'ngSanitize',
    // 'ngGrid',
    // 'ng-showdown',
    // 'angularjs-dropdown-multiselect',
    // 'ui.select2',
    // 'ui.select',
    // 'ui.ace',
    // 'ui.sortable',
    // 'ui.bootstrap',
    // 'ui.tinymce',
    // 'firebase'
  ])
    .config(['$compileProvider', function ($compileProvider) {
      plugin.compileProvider = $compileProvider;
    }])
    .service('znData', [function () {
      return function znData (resourceName) {
        function shipItViaPostMessage (params, body, optionalCB) {
          return client.call(resourceName, params, body, optionalCB)
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
      return {}
    }])
    .service('$location', [function () {
      $location.port = function () {
        return specialData.port
      }

      $location.url = function (arg) {
        if (arg) {
          specialData.url = arg
          return client.call('location')
        }

        return specialData.url
      }
    }])
    .service('$routeParams', [function () {
      return { workspace_id: 1 }
    }]);
})(plugin);

export default plugin
