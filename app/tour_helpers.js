/* global angular: false */

(function angularBootstrapTour(app) {
    'use strict';

    app.factory('TourHelpers', ['$templateCache', '$compile', 'TourConfig', function ($templateCache, $compile, TourConfig) {

        var helpers = {};

        /**
         * Helper function that calls scope.$apply if a digest is not currently in progress
         * Borrowed from: https://coderwall.com/p/ngisma
         *
         * @param {$rootScope.Scope} scope
         * @param {Function} fn
         */
        function safeApply(scope, fn) {
            var phase = scope.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                scope.$apply(fn);
            }
        }

        /**
         * Compiles and links a template to the provided scope
         *
         * @param {String} template
         * @param {$rootScope.Scope} scope
         * @returns {Function}
         */
        function compileTemplate(template, scope) {
            return function (/*index, step*/) {
                var $template = angular.element(template); //requires jQuery
                safeApply(scope, function () {
                    $compile($template)(scope);
                });
                return $template;
            };

        }

        /**
         * Looks up a template by URL and passes it to {@link helpers.compile}
         *
         * @param {String} templateUrl
         * @param {$rootScope.Scope} scope
         * @returns {Function}
         */
        function lookupTemplate(templateUrl, scope) {

            var template = $templateCache.get(templateUrl);

            if (template) {
                return compileTemplate(template, scope);
            }

            return null;

        }

        /**
         * Converts a stringified boolean to a JS boolean
         *
         * @param string
         * @returns {*}
         */
        function stringToBoolean(string) {
            if (string === 'true') {
                return true;
            } else if (string === 'false') {
                return false;
            }

            return string;
        }

        /**
         * Helper function that attaches proper compiled template to options
         *
         * @param {$rootScope.Scope} scope
         * @param {Attributes} attrs
         * @param {Object} options represents the tour or step object
         */
        helpers.attachTemplate = function (scope, attrs, options) {

            var template;

            if (attrs.template) {
                template = compileTemplate(scope.$eval(attrs.template), scope);
            }

            if (attrs.templateUrl) {
                template = lookupTemplate(attrs.templateUrl, scope);
            }

            if (template) {
                options.template = template;
            }

        };

        /**
         * Helper function that attaches event handlers to options
         *
         * @param {$rootScope.Scope} scope
         * @param {Attributes} attrs
         * @param {Object} options represents the tour or step object
         * @param {Array} events
         */
        helpers.attachEventHandlers = function (scope, attrs, options, events) {

            angular.forEach(events, function (eventName) {
                if (TourConfig.get('prefixOptions')) {
                    eventName = TourConfig.get('prefix') + eventName.charAt(0).toUpperCase() + eventName.substr(1);
                }
                if (attrs[eventName]) {
                    options[eventName] = function (tour) {
                        safeApply(scope, function () {
                            scope.$eval(attrs[eventName]);
                        });
                    };
                }
            });

        };

        /**
         * Helper function that attaches observers to option attributes
         *
         * @param {Attributes} attrs
         * @param {Object} options represents the tour or step object
         * @param {Array} keys attribute names
         */
        helpers.attachInterpolatedValues = function (attrs, options, keys) {

            angular.forEach(keys, function (key) {
                if (TourConfig.get('prefixOptions')) {
                    key = TourConfig.get('prefix') + key.charAt(0).toUpperCase() + key.substr(1);
                }
                if (attrs[key]) {
                    options[key] = stringToBoolean(attrs[key]);
                    attrs.$observe(key, function (newValue) {
                        options[key] = stringToBoolean(newValue);
                    });
                }
            });

        };

        return helpers;

    }]);

}(angular.module('bm.bsTour')));
