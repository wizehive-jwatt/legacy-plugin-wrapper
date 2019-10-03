export function Directives(plugin) {
    /**
     * Wizehive directives
     *
     * These are behavioral directives. Not ones that behave as interactive "widgets".
     *
     * Copyright (c) WizeHive - http://www.wizehive.com
     *
     * @since 0.x.x
     */
    plugin
    /**
     * App path directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('appPath', ['$location', function($location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.click(function() {
                    var href = $(this).attr('href') || $(this).attr('app-path');
                    if (href && !/#|javascript/g.test(href) && !$(this).attr('ng-click')) {
                        scope.$apply(function() {
                            $location.path(href);
                            scope.$emit('pathChanged');
                        });
                        return false;
                    }
                });
            }
        };
    }])
    /**
     * Class list directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('classList', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var classes = (attrs.classList || '').replace(/ /g, '').split(',');
                angular.forEach(classes, function(className) {
                    var parts = className.split('.'),
                        last = parts[parts.length-1].replace('$', '');
                    scope.$watch(className, function(val) {
                        if (val) {
                            element.addClass(last);
                        } else {
                            element.removeClass(last);
                        }
                    });
                });
            }
        };
    }])
    /**
     * Cloak data directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('cloakData', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $loading,
                    timeout,
                    waiting = false, // so we know if we're already waiting if "loaded" gets set to false more than once
                    delay = 0,
                    watcher = 'loaded'; // If no value is passed to ng-cloak, watch $scope.loaded by default
    
                if (attrs.cloakData) {
                    watcher = attrs.cloakData;
                }
    
                scope.$watch(watcher, function(loaded) {
                    if (loaded) {
                        waiting = false;
                        if (timeout) {
                            clearTimeout(timeout);
                        }
                        if ($loading) {
                            $loading.remove();
                        }
                        element.css('visibility', 'visible');
                    } else if (!waiting) {
                        waiting = true;
                        timeout = setTimeout(function() {
                            $loading = angular.element('<div class="loading sans">Loading ... <span class="throbber"></span></div>').insertBefore(element);
                            timeout = null;
                        }, delay);
                        element.css('visibility', 'hidden');
                    }
                });
            }
        };
    }])
    /**
     * Dropdown menu persist directive
     *
     * Add overrides to bootstrap dropdown to keep it open on inside clicks
     *
     * @author Paul W. Smith <paul@wizehive.com>
     * @since 0.5.25
     */
    .directive('dropdownMenuPersist', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // Prevent menu from closing on inside click, unless it has persistent-close class
                // (to allow for save/cancel buttons)
                $(element).click(function(e) {
                    if (!$(e.target).hasClass('dropdown-menu-close')) {
                        e.stopPropagation();
                    }
                });
            }
        };
    }])
    .directive('znFocusMe', ['$timeout', function($timeout) {
    
        return {
    
            restrict: 'A',
            require: 'ngModel',
            scope: {
                focus: '=znFocusMe'
            },
    
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('focus.enabled', function(value) {
    
                    if (value === true) {
                        $timeout(function() {
                            ngModel.$setViewValue('');
                            ngModel.$render();
                            element[0].focus();
                        });
                    }
                }, true);
                element.bind('blur', function() {
                    scope.$apply(function() {
                        scope.focus.enabled = false;
                    });
                });
            }
    
        };
    
    }])
    // https://stackoverflow.com/a/18295416
    .directive('znFocusOn', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
    
                scope.$on('znFocusOn', function(event, name) {
                    if (name === attrs.znFocusOn) {
                        element[0].focus();
                    }
                });
    
            }
        };
    }])
    .directive('znDefaultValue', [function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                'record': '='
            },
            link: function (scope, el, attrs, ngModel) {
    
                unwatch = scope.$watch('record', function(record) {
    
                    if (!record) {
                        return;
                    }
    
                    if (attrs.znDefaultValue && !record.id && !record.localId) {
    
                        ngModel.$setViewValue(attrs.znDefaultValue);
                        ngModel.$render();
                        unwatch();
    
                    }
    
                });
            }
        };
    }])
    .directive('znFileSelect', ['$parse', '$rootScope', function ($parse, $rootScope) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: true,
            link: function (scope, el, attrs, ngModel) {
    
                var fn = $parse(attrs.znFileSelect);
    
                // Clear File
                scope.$watch(attrs.ngModel, function(value) {
                    if (!value) {
                        el.val(null);
                    }
                }, true);
    
                // On File Selection, Execute Callback and
                // Update Model Value with the FileList object
                el.bind('change', function () {
    
                    ngModel.$setViewValue(this.files);
    
                    scope.$apply(function() {
                        fn(scope);
                    });
    
                    this.value = null;
                });
            }
        };
    }])
    
    .directive('znDatetimepickerWrapper', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: true,
            replace: false,
            controller: ['$scope', '$timeout', function($scope, $timeout) {
    
                $scope.dateOptions = {
                    'show-weeks': false
                };
    
                $scope.today = new Date();
    
                // Default Format
                $scope.format = 'yyyy-MM-dd';
    
                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
    
                    $timeout(function() {
                        $scope.opened = true;
                    });
                };
    
                $rootScope.$watch('user', function(user) {
    
                    if (user && user.settings.dateFormat) {
    
                        $scope.format = user.settings.dateFormat.replace('mm', 'MM');
                        $scope.user = user;
    
                    }
    
                });
    
            }],
            link: function(scope, element, attrs, ngModelCtrl) {
    
                var syncTime = scope.$eval(attrs.syncTime),
                    apiFormat = $rootScope.apiDateFormat,
                    datepicker = element.find('[datepicker-popup]'),
                    datepickerNgModelCtrl = datepicker.controller('ngModel');
    
                setApiFormat(syncTime);
    
                scope.$watch(attrs.syncTime, function(val) {
                    setApiFormat(val);
                });
    
                function setApiFormat(val) {
                    if (val) {
                        apiFormat = $rootScope.apiDateTimeFormat;
                        syncTime = true;
                    } else {
                        apiFormat = $rootScope.apiDateFormat;
                        syncTime = false;
                    }
                }
    
                function setValue(value) {
                    if (value != ngModelCtrl.$modelValue) {
                        ngModelCtrl.$setViewValue(value);
                    }
                }
    
                function parse(value, strict) {
    
                    if (!value) {
                        return value;
                    }
    
                    if (typeof value === 'object' &&
                        value.constructor.name === 'Date') { // valid Date object
    
                        var apiDate = moment(scope.date);
    
                        if (syncTime && moment(scope.time).isValid()) {
                            var apiTime = moment(scope.time);
    
                            apiDate.hour(apiTime.hour());
                            apiDate.minute(apiTime.minute());
                            apiDate.second(0);
                        }
    
                        value = apiDate.format(apiFormat);
    
                    } else { // manually typed string
    
                        var userFormat = scope.format.toUpperCase(),
                            parsedDate = moment(value, userFormat, strict);
    
                        if (parsedDate.isValid()) {
                            value = parsedDate.format(apiFormat);
                        }
    
                    }
    
                    return value;
    
                }
    
                // Take User Data, Convert it to Model Data
                ngModelCtrl.$parsers.unshift(function(value) {
                    return parse(value, true);
                });
    
                // Take Model Data, Convert it to View Data
                ngModelCtrl.$formatters.push(function(value) {
    
                    var result;
    
                    if (value) {
    
                        var mDate = moment(value, apiFormat, true);
    
                        if (mDate.isValid()) {
                            result = mDate.toDate();
                        }
    
                    }
    
                    return result;
    
                });
    
                // Update Directive Data
                ngModelCtrl.$render = function() {
    
                    var value = ngModelCtrl.$viewValue;
    
                    scope.date = value;
                    scope.time = value;
    
                };
    
                scope.$watch(function() {
                    return datepickerNgModelCtrl.$viewValue;
                }, function(value) {
    
                    // Pass Along Date Validation to Directive
                    ngModelCtrl.$setValidity('date', datepickerNgModelCtrl.$valid);
    
                    value = parse(value, true);
    
                    setValue(value);
    
                });
    
                if (syncTime) {
                    scope.$watch('time', function(time) {
                        time = parse(time, true);
                        setValue(time);
                    });
                }
    
            }
        };
    }])
    /**
     * Datetime picker directive
     *
     * @author	Everton Yoshitani <everton@wizehive.com>
     * @since 0.x.x
     */
    .directive('datetimepicker', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                var dateFormat = element.attr('datetimepicker-date-format'),
                    autoClose = (element.attr('datetimepicker-autoclose') === 'true') ? true : false,
                    defaultToModelValue = (element.attr('datetimepicker-default-to-model-value') === 'true') ? true : false;
                if (!dateFormat) {
                    dateFormat = 'yyyy-mm-dd H:ii P';
                }
                /*
                 * Check format options for bootstrap-datetimepicker
                 * at http://www.malot.fr/bootstrap-datetimepicker/index.php
                 *
                 * If `dateFormat` do not contains any of the time formats (p,P,s,ss,i,ii,h,hh or HH)
                 * the time picker part will be set off, acting s a datepicker only
                 */
                var minView = (dateFormat.match(/[psih]/i)) ? 0 : 2;
                attrs.$observe('datetimepickerStartDate', function(val) {
                    element.datetimepicker('setStartDate', val);
                });
                if (!element.attr('placeholder')) {
                    attrs.$set('placeholder', dateFormat);
                }
                element.datetimepicker({
                    format: dateFormat,
                    autoclose: autoClose,
                    todayBtn: true,
                    minView: minView,
                    showMeridian: true
                });
                element.datetimepicker().on('show', function(evt) {
                    if (defaultToModelValue) {
                        var format = element.datetimepicker.DPGlobal.parseFormat(dateFormat, 'standard'),
                            date = element.datetimepicker.DPGlobal.parseDate(ctrl.$modelValue, format, 'en', 'standard');
                        if (date.getFullYear() > 1900) { // Because some things treat 0000-00-00 as no value
                            element.datetimepicker('update', date);
                        } else {
                            element.datetimepicker('update', new Date());
                        }
                    }
                });
                element.datetimepicker().on('changeDate', function(evt) {
                    var format = element.datetimepicker.DPGlobal.parseFormat(dateFormat, 'standard'),
                        date = element.datetimepicker.DPGlobal.formatDate(evt.date, format, 'en', 'standard');
                    if (ctrl && ctrl.$setViewValue) {
                        // Wrap in $timeout so that it will automatically be $apply()'ed
                        $timeout(function() {
                            ctrl.$setViewValue(date);
                        });
                    }
                });
            }
        };
    }])
    /**
     * Droppable directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('droppable', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).droppable();
            }
        };
    }])
    /**
     * ESC directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('esc', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).keydown(function(evt) {
                    if (evt.which === 27) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('esc');
                        });
                    }
                });
            }
        };
    }])
    /**
     * Input outline directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('inputOutline', [function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).click(function() {
                    $(this).addClass('mouse');
                }).keydown(function() {
                    $(this).removeClass('mouse');
                });
            }
        };
    }])
    /**
     * Sortable directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('sortable', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.sortable({
                    cancel: '.ui-state-disabled',
                    connectWith: '.connected-sortable',
                    update: function(event, ui) {
                        if (scope.updateSortable) {
                            scope.updateSortable(event, ui);
                        }
                    },
                    receive: function(event, ui) {
                        if (scope.receiveSortable) {
                            scope.receiveSortable(event, ui);
                        }
                    },
                    remove: function(event, ui) {
                        if (scope.removeSortable) {
                            scope.removeSortable(event, ui);
                        }
                    }
                });
            }
        };
    }])
    .directive('znCarousel', [function() {
    
        return {
            restrict: 'A',
            scope: true,
            replace: false,
            controller: ['$scope', '$timeout', '$attrs', function($scope, $timeout, $attrs) {
    
                $scope.slidesInSlideshow = $attrs.slides || 3;
                $scope.slidesTimeIntervalInMs = 8000;
    
                $scope.slideStep = function(step) {
    
                    if ($scope.slideTimer) {
                        $timeout.cancel($scope.slideTimer);
                    }
    
                    $scope.slideshow = step;
    
                    $scope.slideTimer = $timeout(function() {
                            $scope.nextSlide();
                        }, $scope.slidesTimeIntervalInMs);
    
                };
    
                $scope.nextSlide = function() {
                    $scope.slideStep(($scope.slideshow % $scope.slidesInSlideshow) + 1);
                };
    
                $scope.slideStep(1);
    
            }]
    
        };
    
    }])
    /**
     * Specify custom behavior when an element is scrolled.
     * Usage: <ANY zn-scroll="expression"> ... </ANY>, where 'expression' is evaluated on scroll
     * Also exposes an $event object within the scope of that expression.
     *
     * @author	Anna Parks
     * @since	0.5.46
     */
    .directive('znScroll', ['$rootScope', '$parse', function ($rootScope, $parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var scrollFunction = $parse(attrs.znScroll);
    
                angular.element('.modal.record-overlay  > .modal-body').scroll(function(event) {
                    scope.$apply(function() {
                        scrollFunction(scope, {$event:event});
                    });
                });
    
            }
        };
    }])
    /**
     * Time picker directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('timepicker', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var options = '',
                    i = 0,
                    j = 0,
                    ampm = 'AM',
                    h, hh, hhh,
                    m, mm,
                    val, sel,
                    defaultVal = '12:00:00';
                for(; i < 24; i++) {
                    h = i < 10 ? '0' + i : i;
                    hh = i > 12 ? i - 12 : i;
                    hh = hh === 0 ? 12 : hh;
                    j = 0;
                    for(; j < 4; j++) {
                        m = j * 15;
                        mm = m < 10 ? '0' + m : m;
                        val = h + ':' + mm + ':00';
                        options += '<option value="' + val + '">' + hh + ':' + mm + ' ' + ampm + '</option>';
                    }
                    if (i === 11) {
                        ampm = 'PM';
                    }
                }
                element.html(options);
                if (attrs.ngModel) {
                    scope.$watch(attrs.ngModel, function(val) {
                        element.val(val || defaultVal);
                    });
                }
            }
        };
    }])
    /**
     * Hover menu directive
     *
     * @author	Paul W. Smith
     * @since	0.5.28
     */
    .directive('hoverMenu', ['$timeout', '$parse', function($timeout, $parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.delay = (angular.isDefined(attrs.delay)) ? attrs.delay : 300;
                // Callback function when menu is displayed
                scope.onShow = angular.noop;
    
                // Set element to show/hide
                attrs.$observe('hoverMenu', function(selector) {
                    scope.menuElem = element.find(selector);
                });
    
                // Set up callback function if one was passed
                attrs.$observe('onShow', function(callback) {
                    // Standard angular stuff
                    var func = $parse(callback);
                    scope.onShow = function() {
                        return func(scope);
                    };
                });
    
                element.bind('mouseenter', function() {
                    scope.setVisible = true;
                    scope.toggleMenu();
                });
    
                element.bind('mouseleave', function() {
                    scope.setVisible = false;
                    scope.toggleMenu();
                });
    
                /**
                 * Toggle menu visibility after a timeout
                 *
                 * @author	Paul W. Smith
                 * @since	0.5.28
                 */
                scope.toggleMenu = function() {
                    $timeout(function() {
                        if (scope.setVisible) {
                            scope.menuElem.addClass('active');
                            // Callback passed into directive
                            scope.onShow();
                        } else {
                            scope.menuElem.removeClass('active');
                        }
                    }, scope.delay);
                };
            }
        };
    }])
    /**
     * Validate directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('validate', ['$compile', function($compile) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var parents = $(element).parents('form[name]'),
                    controlNames = attrs.validate.split(','),
                    form,
                    controls = [];
                function evaluate(submitted) {
                    var valid = true;
                    if (submitted) {
                        angular.forEach(controls, function(control) {
                            valid = valid && control.$valid;
                        });
                    }
                    element[valid ? 'removeClass' : 'addClass']('error');
                }
                if (parents.length) {
                    var formName = parents.first().attr('name');
                    if (formName && scope[formName]) {
                        form = scope[formName];
                        angular.forEach(controlNames, function(controlName) {
                            if (controlName in form) {
                                controls.push(form[controlName]);
                                scope.$watch(formName + '.' + controlName + '.$valid', function(valid) {
                                    evaluate(form.submitted);
                                });
                                $('[name=' + controlName + ']', element).change(function() {
                                    $(this).trigger('input');
                                });
                            }
                        });
                        scope.$watch(formName + '.submitted', function(submitted) {
                            evaluate(submitted);
                        });
                    }
                }
            }
        };
    }])
    /**
     * Form error directive
     *
     * @author Unknow
     * @since 0.x.x
     */
    .directive('formError', [function() {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var name = attrs.name;
    
                scope.$watch(name, function (form) {
                    if (!form) {
                        return;
                    }
    
    
                    scope.$watch(name + '.errorObject', function (error) {
                        if (!error) {
                            return;
                        }
    
                        var errors = wizehive.serializeError(error);
    
                        form.submitted = true;
    
                        var remove = function (path, initialValue, errorContainer) {
                            var unwatcher = scope.$watch(path, function (value) {
                                if (initialValue !== value) {
                                    // Change has been made so clear server validation error
                                    field.$setValidity('server-validation', true);
                                    errorContainer.remove();
                                    unwatcher();
                                }
                            });
                        };
    
                        // Variable path is the path of the error (same thing you would set as ng-model)
                        // Variable x is the content of the error
                        // Variable p is the current value of the field with error
                        for (var path in errors) {
                            if (errors.hasOwnProperty(path)) {
                                var x, field, fieldElement, fieldContainer,
                                    fieldName, errorContainer, controls;
    
                                x = (errors[path] && errors[path].join && errors[path].join('')) || errors[path];
    
                                // Get the field
                                fieldElement = $(element).find('[ng-model="' + path + '"]');
                                fieldName = fieldElement.attr('name');
                                fieldContainer = fieldElement.closest('[validate="' + fieldName + '"]');
                                field = form[fieldName];
    
                                if (!field) {
                                    // No field for this error, skip to prevent errors
                                    continue;
                                }
    
                                // Set the field as problematic
                                field.$setValidity('server-validation', false);
    
                                fieldContainer.addClass('error');
                                errorContainer = $('<div>').addClass('form-error error help-block').text(x);
                                controls = fieldContainer.find('.controls');
    
                                if (!controls.length) {
                                    controls = fieldContainer;
                                }
    
                                controls.append(errorContainer);
                                remove(path, field.$modelValue, errorContainer);
                            }
                        }
                    });
                });
            }
        };
    }])
    /**
     * Follow Record Button
     *
     * Show Follow/Unfollow button
     *
     * @since 0.5.28
     * @author Everton Yoshitani <everton@wizehive.com>
     */
    .directive('followRecordButton', ['$rootScope', 'Data', 'message', function($rootScope, Data, message) {
        return {
            restrict: 'A',
            templateUrl: function(element, attrs) {
                var url = '/templates/partials/follow-record-button';
                if (angular.isDefined(attrs.followRecordButton)) {
                    return url + '-' + attrs.followRecordButton + '.html';
                } else {
                    return url + '-default.html';
                }
            },
            replace: true,
            scope: {
                'record': '=',
                'workspaceId': '='
            },
            link: function(scope, element, attrs) {
    
                // Wait record ID be available
                // Need a watch record is available with a slight delay
                scope.$watch('record', function() {
    
                    // Check if all scope properties are available
                    if (!scope.record || !scope.record.id) {
                        return;
                    }
    
                    // Get subscription status
                    scope.getSubscription = function() {
                        var params = {
                            attributes: 'id',
                            resource: 'records',
                            resourceId: scope.record.id,
                            includeRelated: true,
                            workspace: { id: scope.workspaceId || $rootScope.workspace.id },
                            user: { id: $rootScope.user.id }
                        };
                        Data('Subscriptions').get(
                            params,
                            function(response) {
                                // success
                                if (response && response[0]) {
                                    scope.subscription = true;
                                } else {
                                    scope.subscription = false;
                                }
                            },
                            function(response) {
                                // error
                            }
                        );
                    };
    
                    // Subscribe
                    scope.subscribe = function() {
                        scope.subscription = true;
                        var data = {
                            resource: 'records',
                            resourceId: scope.record.id,
                            includeRelated: true,
                            workspace: { id: scope.workspaceId || $rootScope.workspace.id },
                            user: { id: $rootScope.user.id }
                        };
                        Data('Subscriptions').save(
                            {},
                            data,
                            function(response) {
                                // success
                                scope.subscription = true;
                                $rootScope.$broadcast('subscription-update');
                            },
                            function(response) {
                                // error
                                scope.subscription = false;
                                message('Error: adding subscription', 'error');
                            }
                        );
                    };
    
                    // Unsubscribe
                    scope.unsubscribe = function() {
                        if (!scope.subscription) {
                            return;
                        }
                        scope.subscription = false;
                        Data('Subscriptions').deleteAll({
                                resource: 'records',
                                resourceId: scope.record.id,
                                includeRelated: true
                            },
                            function(response) {
                                // success
                                $rootScope.$broadcast('subscription-update');
                            },
                            function(response) {
                                // error
                                scope.subscription = true;
                                message('Error: removing subscription', 'error');
                            }
                        );
                    };
    
                    // Get subscription
                    scope.getSubscription();
    
                    // Listen for subscription updates
                    scope.$on('subscription-update', function(evt, obj) {
                        scope.getSubscription();
                    });
    
                });
    
            }
        };
    }])
    /**
     * Modal
     *
     * @since 0.5.29
     * @author Everton Yoshitani <everton@wizehive.com>
     */
    .directive('modal', ['modal', function(modal) {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, element, attrs) {
                if (!attrs.href && !attrs.modal) {
                    return;
                }
                element.bind('click', function(e) {
                    e.preventDefault();
                    modal({
                        title: attrs.title || '',
                        templateUrl: attrs.href || attrs.modal,
                        classes: attrs.modalclass || ''
                    });
                });
            }
        };
    }])
    /**
     * Draggable Wrapper Directive
     *
     * @since	0.5.35
     * @author	Wes DeMoney <wes@wizehive.com>
     */
    .directive('uiDraggable', [function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs, ctrl) {
    
                scope.$watch(attrs.uiDraggable, function(newVal) {
                    angular.forEach(newVal, function(value, key) {
                        elem.draggable('option', key, value);
                    });
                }, true);
    
                elem.draggable();
    
            }
        };
    }])
    /**
     * checkList directive - allow multi value checkboxes to with with ng-model
     *
     * @author	Unknown
     * @since	0.5.x
     */
    .directive('checkList', [function() {
        return {
            scope: {
                checkValue: '=',
                list: '=checkList'
            },
            link: function(scope, elem, attrs) {
                var handler = function(setup) {
                    if (setup) {
                        if (!angular.isArray(scope.list)) {
                            var value;
                            if (scope.list) {
                                if (scope.list.id) {
                                    // old member field value is
                                    //still in single response format {id: 2, 'name': anna}
                                    // and was converted from dropdown to checklist.
                                    value = parseInt(scope.list.id, 10);
                                } else {
                                    // single checkbox value came back as string
                                    value = scope.list;
                                }
                            }
                            scope.list = [];
                            if (value) {
                                scope.list.push(value);
                            }
                        } else {
                            var map = scope.list.map(
                                function(obj) {
                                    if (typeof obj == 'object' && obj.id) {
                                        return obj.id.toString();
                                    } else {
                                        return obj;
                                    }
                                }
                            );
                            scope.list = map;
                        }
                    }
                    var checked = elem.prop('checked');
    
                    var checkValue;
    
                    if (scope.checkValue) {
                        checkValue = scope.checkValue.toString();
                    } else {
                        checkValue = attrs.checkValue;
                    }
    
                    var index = scope.list.indexOf(checkValue);
    
                    if (checked && index == -1) {
                        if (setup) {
                            elem.prop('checked', false);
                        } else {
                            scope.list.push(checkValue);
                        }
                    } else if (!checked && index != -1) {
                        if (setup) {
                            elem.prop('checked', true);
                        } else {
                            scope.list.splice(index, 1);
                        }
                    }
                    if (!setup) {
                        var ctrl=scope.$parent.webform[elem.data("parent_field")];
                        ctrl.$setViewValue(ctrl.$modelValue);
                    }
                };
    
                var setupHandler = handler.bind(null, true);
                var changeHandler = handler.bind(null, false);
    
                elem.bind('change', function() {
                    scope.$apply(changeHandler);
                });
                scope.$watch('list', setupHandler, true);
            }
        };
    }])
    /**
     * User Event
     *
     * @since	0.5.45
     * @author	Wes DeMoney <wes@wizehive.com>
     */
    .directive('userEvent', ['$window', function($window) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                data: '@userEvent'
            },
            link: function(scope, element, attrs) {
                if (!scope.data) {
                    return;
                }
                element.bind('click', function(e) {
                    e.preventDefault();
    
                    var name = '',
                        data = {};
    
                    if (typeof scope.data === 'string') {
                        name = scope.data;
                        data = {};
                    }
                    else {
                        name = scope.data.name;
                        data = angular.copy(scope.data);
                        data.name = null;
                    }
    
                    $window.userEvent.track(name, data);
                });
            }
        };
    }])
    /**
     * Auto Expanding Textarea
     *
     * @author	http://blog.justonepixel.com/geek/2013/08/14/angularjs-auto-expand/
     * @author	Roberto Carraretto <roberto@wizehive.com>
     */
    .directive('ngAutoExpand', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function( $scope, elem, attrs, ngModelCtrl) {
    
                var lockHeight = function(element) {
                    element.css("height", element.height());
                };
    
                var unlockHeight = function(element) {
                    element.css("height", "auto");
                };
    
                var changeToIdealHeight = function(element) {
                    $(element).height(0);
                    var height = $(element)[0].scrollHeight;
    
                    // 8 is for the padding
                    if (height < 20) {
                        height = 28;
                    }
                    $(element).height(height-8);
                };
    
                elem.bind('keyup', function($event) {
                    var element = $event.target;
                    var parent = $(element).parent();
    
                    // Lock parent's height
                    // to prevent a quick shrinking and expanding glitch
                    // that happens when the text area is at a considerable size (WIZ-3363)
                    lockHeight(parent);
    
                    changeToIdealHeight(element);
    
                    // Now that the element has shrinked or expanded
                    // We can unlock the parent's height (WIZ-3363)
                    unlockHeight(parent);
                });
    
                // Expand the textarea as soon as it is added to the DOM
                $timeout(function() {
                    changeToIdealHeight(elem);
                }, 0);
    
                $scope.$watch(function() {
                    return ngModelCtrl.$viewValue;
                }, function() {
                    changeToIdealHeight(elem);
                });
    
            }
        };
    /**
     * Height match widget
     *
     * Automatically adjust an element's height to equal that of an ancestor element
     *
     * Copyright (c) WizeHive - http://www.wizehive.com
     *
     * @author	Paul W. Smith <paul@wizehive.com>
     * @since	0.5.48
     * @param	heightMatch - selector of ancestor element to match.
     */
    }]).directive('heightMatch', ['$window', '$timeout', function($window, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
    
                function setInnerHeight() {
                    element.css('min-height', element.closest(attrs.heightMatch).innerHeight() + 'px');
                }
    
                // Re-set height on window resize
                angular.element($window).bind('resize', setInnerHeight);
    
                // Set height initially
                setInnerHeight();
    
                // remove event listener
                scope.$on("$destroy",function(event) {
                    angular.element($window).unbind('resize', setInnerHeight);
                });
            }
        };
    }])
    /**
     * Open Lightbox Programmatically
     *
     * @author	Wes DeMoney <wes@wizehive.com>
     * @since	0.5.62
     * @param	{string}	url		Url to open in Lightbox
     */
    .directive('appLightbox', ['$location', 'recordOverlayService', function($location, recordOverlayService) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
    
                // Lightbox gets confused by data-bound href, so do it this way
                var openLightbox = function(url) {
                    var a = angular.element('<a href="' + url + '" data-lightbox="' + Math.random() * 1000 + '"></a>').appendTo(elem);
    
                    // Open lightbox
                    a.trigger('click');
                    angular.element('#lightbox').on('close', function() {
                        recordOverlayService.ignoreWarnIfDirty = true;
                        $location.search('lightbox', null).replace();
                        scope.$digest();
                    });
                };
    
                // Open lightbox when url changes
                attrs.$observe('url', function(url) {
                    if (!url) {
                        return;
                    }
                    openLightbox(url);
                });
    
            }
        };
    }])
    .directive('fileViewerLink', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: '/templates/partials/file-viewer-link.html',
            scope: {
                file: '='
            },
            link: function(scope, element, attrs) {
                scope.enableFileViewer = wizehive.config('enableFileViewer');
                scope.openFileViewer = $rootScope.openFileViewer;
            }
        };
    }])
    /**
     * Open File Lightbox
     *
     * @author	Wes DeMoney <wes@wizehive.com>
     * @since	0.5.62
     * @param	{int}	file Id
     */
    .directive('lightboxFile', ['$location', function($location) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                data: '@lightboxFile'
            },
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    e.preventDefault();
    
                    $location.search('lightbox', 'file.' + scope.data).replace();
                });
            }
        };
    }])
    
    /**
     * Update on Enter
     *
     * Updates a model value after enter key is pressed
     */
    .directive('updateOnEnter', [function() {
        return {
            priority: 100,
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                element.unbind('input').unbind('keydown').unbind('change');
                element.bind('keydown', function(e) {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) {
                        scope.$apply(function() {
                            ctrl.$setViewValue(element.val());
                        });
                    }
                });
            }
        };
    }])
    .directive('limitTo', [function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var limit = parseInt(attrs.limitTo);
                elem.bind('keypress', function (e) {
                    if (elem[0].value.length >= limit) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
        };
    }])
    /**
     * Limit an input to numeric values only. Invalid characters will be removed
     *
     * @author	Paul W. Smith <paul@wizehive.com>
     * @since	0.5.79
     * @param	{string}	input value
     */
    .directive('numbersOnly', [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                ngModel.$parsers.push(function (input) {
                    if (!input) {
                        return '';
                    }
    
                    // Toggle Negative Value
                    function toggleNegativeValue(value) {
    
                        numNegatives = value.length - value.replace(/-/g, "").length;
    
                        if (numNegatives > 1 || value.indexOf('-') !== 0) {
    
                            value = value.replace(/-/g, "");
    
                            if (numNegatives % 2 !== 0) {
                                // Prepend Negative
                                value = '-' + value;
                            }
    
                        }
    
                        return value;
    
                    }
    
                    var matches = input.match(/^[\-\d]+\.?[\-\d]*/);
                    var newValue = (matches && matches.length && matches[0]) || '';
    
                    newValue = toggleNegativeValue(newValue);
    
                    if (newValue !== input) {
                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    }
    
                    return newValue;
                });
            }
        };
    }])
    .directive('znFormSelect', [function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=ngModel',
                ngDisabled: '=',
                ngChange: '&',
                forms: '=',
                formProperty: '@'
            },
            templateUrl: '/templates/partials/form-select/form-select.html',
            link: function(scope, element, attr) {
    
                scope.form = {};
    
                scope.$watch('ngDisabled', function(ngDisabled) {
                    scope.disabled = (!ngDisabled && !attr.hasOwnProperty('ngDisabled')) ? false : ngDisabled || true;
                });
    
                // update zn-form-select ngModel
                scope.$watch('form.selected', function(selected) {
                    var value;
                    if (selected) {
                        value = scope.formProperty ? selected[scope.formProperty] : selected;
                    }
                    if (value) {
                        scope.ngModel = value;
                        scope.ngChange();
                    }
                });
    
                // update ui-select ngModel
                scope.$watch('ngModel', function(ngModel) {
                    var value;
                    if (ngModel && scope.formProperty) {
                        angular.forEach(scope.forms, function(form) {
                            if (form[scope.formProperty] == ngModel) {
                                value = angular.copy(form);
                            }
                        });
                    } else if (ngModel) {
                        value = ngModel;
                    }
                    if (value) {
                        scope.form.selected = value;
                    }
                });
    
            }
        };
    }])
    .directive('znMemberSelect', [function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=ngModel',
                ngDisabled: '=',
                ngChange: '&',
                members: '=',
                memberProperty: '@'
            },
            templateUrl: '/templates/partials/member-select/member-select.html',
            link: function(scope, element, attr) {
    
                scope.member = {};
    
                scope.$watch('ngDisabled', function(ngDisabled) {
                    scope.disabled = (!ngDisabled && !attr.hasOwnProperty('ngDisabled')) ? false : ngDisabled || true;
                });
    
                // update zn-member-select ngModel
                scope.$watch('member.selected', function(selected) {
                    var value;
                    if (selected) {
                        value = scope.memberProperty ? selected[scope.memberProperty] : selected;
                    }
                    if (value) {
                        scope.ngModel = value;
                        scope.ngChange();
                    }
                });
    
                // update ui-select ngModel
                scope.$watch('ngModel', function(ngModel) {
                    var value;
                    if (ngModel && scope.memberProperty) {
                        angular.forEach(scope.members, function(member) {
                            if (member[scope.memberProperty] == ngModel) {
                                value = angular.copy(member);
                            }
                        });
                    } else if (ngModel) {
                        value = ngModel;
                    }
                    if (value) {
                        scope.member.selected = value;
                    }
                });
    
            }
        };
    }])
    .directive('znFormFolderSelect', [function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=ngModel',
                ngDisabled: '=',
                ngChange: '&',
                folders: '=',
                folderProperty: '@'
            },
            templateUrl: '/templates/partials/form-folder-select/form-folder-select.html',
            link: function(scope, element, attr) {
    
                scope.folder = {};
    
                scope.$watch('ngDisabled', function(ngDisabled) {
                    scope.disabled = (!ngDisabled && !attr.hasOwnProperty('ngDisabled')) ? false : ngDisabled || true;
                });
    
                // update zn-form-select ngModel
                scope.$watch('folder.selected', function(selected) {
                    var value;
                    if (selected) {
                        value = scope.folderProperty ? selected[scope.folderProperty] : selected;
                    }
                    if (value) {
                        scope.ngModel = value;
                        scope.ngChange();
                    }
                });
    
                // update ui-select ngModel
                scope.$watch('ngModel', function(ngModel) {
                    var value;
                    if (ngModel && scope.folderProperty) {
                        angular.forEach(scope.folders, function(folder) {
                            if (folder[scope.folderProperty] == ngModel) {
                                value = angular.copy(folder);
                            }
                        });
                    } else if (ngModel) {
                        value = ngModel;
                    }
                    if (value) {
                        scope.folder.selected = value;
                    }
                });
    
            }
        };
    }])
    .directive('recordOverlayFolderPicker', [function() {
        return {
            restrict: 'A',
            scope: {
                ngModel: '=ngModel',
                folders: '=',
                onChangeFolder: '&onChangeFolder'
            },
            require: 'ngModel',
            templateUrl: '/templates/partials/record-overlay/folder-picker-directive.html',
            link: function(scope, element, attr, ngModelCtrl) {
    
                scope.folder = null;
    
                scope.folderSearch = null;
    
                scope.maxFolders = 4;
    
                scope.folderSearchInputFocus = {};
    
                function findFolder(folderId) {
                    var folder = scope.folders.filter(function(folder) {
                        return folder.id == folderId;
                    });
    
                    if (folder && folder.length) {
                        return folder.shift();
                    }
    
                    return;
                }
    
                // Convert Model Value to View Value
                ngModelCtrl.$formatters.push(function(modelValue) {
                    return findFolder(modelValue);
                });
    
                // Convert View Value to Model Value
                ngModelCtrl.$parsers.push(function(viewValue) {
    
                    if (!viewValue) {
                        return;
                    }
    
                    return viewValue.id;
    
                });
    
                // Render to Directive Scope Variables
                ngModelCtrl.$render = function() {
                    scope.folder = ngModelCtrl.$viewValue;
                };
    
                function setSearchPristine() {
    
                    var elemSearch = element.find('.folderSearch');
    
                    elemSearch
                        .toggleClass('ng-dirty', ngModelCtrl.$dirty)
                        .toggleClass('ng-pristine', ngModelCtrl.$pristine);
    
                }
    
                scope.changeFolder = function(folderId) {
    
                    setSearchPristine();
    
                    scope.onChangeFolder({ folderId: folderId });
    
                    var dropdownCtrl = element.find('[dropdown]').controller('dropdown');
                    dropdownCtrl.toggle();
    
                };
    
                /**
                 * On Toggle Folder Dropdown
                 *
                 * @param	Boolean	open
                 */
                scope.onToggleFolderDropdown = function(open) {
    
                    if (open) {
                        scope.folderSearchInputFocus.enabled = true;
                    }
                    else {
                        setSearchPristine();
                    }
    
                };
    
            }
        };
    }])
    .directive('markdown', ['$filter', '$compile', 'ExternalUrlPrompt',
    function($filter, $compile, ExternalUrlPrompt) {
    
        return {
            scope: {
                markdown: '=markdown'
            },
            link: function(scope, element, attr) {
    
                var znMarkdown = $filter('znMarkdown');
    
                // This is redundant to the externalUrlPrompt directive, but the directive doesnt work in this context and this was the only approach where ngClick would work
    
                scope.openExternalUrlPrompt = function($event) {
    
                    var url = angular.element($event.currentTarget).attr('href');
    
                    if (ExternalUrlPrompt.isExternalUrl(url)) {
                        $event.preventDefault();
                        ExternalUrlPrompt.open(url);
                    }
    
                };
    
                scope.$watch('markdown', function(markdown) {
    
                    markdown = markdown || '';
    
                    markdown = znMarkdown(markdown);
    
                    // Post Formatting
                    markdown = markdown.replace(/<a href="(.+)" target="_blank">/g, '<a href="$1" target="_blank" ng-click="openExternalUrlPrompt($event);">');
    
                    element.html($compile(markdown)(scope));
    
                });
    
            }
        };
    
    }]);
    }