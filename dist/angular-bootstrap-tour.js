/* global Tour: false */

/**
 * @file angular-bootstrap-tour is micro-library.
 * Scaffolded with generator-microjs
 * @author  <Ben March>
 */


(function angularBootstrapTour(app) {
    'use strict';

    app.factory('TourHelpers', ['$templateCache', '$compile', function ($templateCache, $compile) {

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

    app.controller('TourController', ['$filter', function ($filter) {

        var self = this,
            steps = [],
            tour;

        /**
         * Sorts steps based on "order" and set next and prev options appropriately
         *
         * @param {Array} steps
         * @returns {Array}
         */
        function orderSteps(steps) {
            var ordered = $filter('orderBy')(steps, 'order');

            angular.forEach(ordered, function (step, index) {
                step.next = ordered[index + 1] ? index + 1 : - 1;
                step.prev = index - 1;
            });

            return ordered;
        }

        /**
         * As steps are linked, add them to the tour options
         */
        self.refreshTour = function () {
            if (tour) {
                tour._options.steps = [];
                tour.addSteps(orderSteps(steps));
            }
        };

        /**
         * Adds a step to the tour
         *
         * @param {object} step
         */
        self.addStep = function (step) {
            if (~steps.indexOf(step)) {
                return;
            }

            steps.push(step);
            self.refreshTour();
        };

        /**
         * Removes a step from the tour
         *
         * @param step
         */
        self.removeStep = function (step) {
            if (!~steps.indexOf(step)) {
                return;
            }

            steps.splice(steps.indexOf(step), 1);
            self.refreshTour();
        };

        /**
         * Returns the list of steps
         *
         * @returns {Array}
         */
        self.getSteps = function () {
            return steps;
        };

        /**
         * Initialize the tour
         *
         * @param {object} options
         * @returns {Tour}
         */
        self.init = function (options) {
            options.steps = orderSteps(steps);
            tour = new Tour(options);
            return tour;
        };


    }]);

    app.directive('tour', ['TourHelpers', function (TourHelpers) {

        return {
            restrict: 'EA',
            scope: true,
            controller: 'TourController',
            link: function (scope, element, attrs, ctrl) {

                //Pass static options through or use defaults
                var tour = {},
                    events = 'onStart onEnd afterGetState afterSetState afterRemoveState onShow onShown onHide onHidden onNext onPrev onPause onResume'.split(' '),
                    options = 'name container keyboard storage debug redirect duration basePath backdrop orphan'.split(' ');

                //Pass interpolated values through
                TourHelpers.attachInterpolatedValues(attrs, tour, options);

                //Attach event handlers
                TourHelpers.attachEventHandlers(scope, attrs, tour, events);

                //Compile template
                TourHelpers.attachTemplate(scope, attrs, tour);

                //Monitor number of steps
                scope.$watchCollection(ctrl.getSteps, function (steps) {
                    scope.stepCount = steps.length;
                });

                //If there is an options argument passed, just use that instead
                if (attrs.tourOptions) {
                    angular.extend(tour, scope.$eval(attrs.tourOptions));
                }

                //Initialize tour
                scope.tour = ctrl.init(tour);

            }
        };

    }]);

    app.directive('tourStep', ['TourHelpers', function (TourHelpers) {

        return {
            restrict: 'EA',
            scope: true,
            require: '^tour',
            link: function (scope, element, attrs, ctrl) {

                //Assign required options
                var step = {
                        element: element
                    },
                    events = 'onShow onShown onHide onHidden onNext onPrev onPause onResume'.split(' '),
                    options = 'content title path animation container placement backdrop redirect orphan reflex'.split(' ');

                //Pass interpolated values through
                TourHelpers.attachInterpolatedValues(attrs, step, options);
                attrs.$observe('order', function (order) {
                    step.order = !isNaN(order*1) ? order*1 : 0;
                    ctrl.refreshTour();
                });

                //Attach event handlers
                TourHelpers.attachEventHandlers(scope, attrs, step, events);

                //Compile templates
                TourHelpers.attachTemplate(scope, attrs, step);

                //Check whether or not the step should be skipped
                function stepIsSkipped() {
                    var skipped;
                    if (attrs.skip) {
                        skipped = scope.$eval(attrs.skip);
                    }
                    if (!skipped) {
                        skipped = element.is(':hidden');
                    }
                    return skipped;
                }
                scope.$watch(stepIsSkipped, function (skip) {
                    if (skip) {
                        ctrl.removeStep(step);
                    } else {
                        ctrl.addStep(step);
                    }
                });

                //If there is an options argument passed, just use that instead
                if (attrs.options) {
                    angular.extend(step, scope.$eval(attrs.options));
                }

                //Add step to tour
                ctrl.addStep(step);

            }
        };

    }]);

}(angular.module('bm.bsTour', [])));


