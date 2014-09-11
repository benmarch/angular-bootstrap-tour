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
         * Helper function that attaches proper compiled template to options
         *
         * @param {$rootScope.Scope} scope
         * @param {Attributes} attrs
         * @param {Object} options
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
         * @param {Object} options
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
        function refreshTour() {
            if (tour) {
                tour._options.steps = [];
                tour.addSteps(orderSteps(steps));
            }
        }

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
            refreshTour();
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
            refreshTour();
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
                var options = {
                        name: attrs.name || 'tour',
                        container: attrs.container || 'body',
                        keyboard: attrs.keyboard || true,
                        storage: attrs.storage ? scope.$eval(attrs.storage) : window.localStorage,
                        debug: attrs.debug || false,
                        redirect: attrs.redirect || true,
                        duration: attrs.duration || false,
                        basePath: attrs.basePath || '',
                        placement: attrs.placement || 'right',
                        backdrop: attrs.backdrop || false,
                        orphan: attrs.orphan || false
                    },
                    events = 'onStart onEnd afterGetState afterSetState afterRemoveState onShow onShown onHide onHidden onNext onPrev onPause onResume'.split(' ');

                //Attach event handlers
                TourHelpers.attachEventHandlers(scope, attrs, options, events);

                //Compile template
                TourHelpers.attachTemplate(scope, attrs, options);

                //Monitor number of steps
                scope.$watchCollection(ctrl.getSteps, function (steps) {
                    scope.stepCount = steps.length;
                });

                //If there is an options argument passed, just use that instead
                if (attrs.tourOptions) {
                    angular.extend(options, scope.$eval(attrs.tourOptions));
                }

                //Initialize tour
                scope.tour = ctrl.init(options);

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
                        element: element,
                        order: attrs.order || 0
                    },
                    events = 'onShow onShown onHide onHidden onNext onPrev onPause onResume'.split(' ');

                //Pass static values through
                if (attrs.path) { step.path = attrs.path; }
                if (attrs.animation) { step.animation = attrs.animation; }
                if (attrs.container) { step.container = attrs.container; }
                if (attrs.placement) { step.placement = attrs.placement; }
                if (attrs.backdrop) { step.backdrop = attrs.backdrop; }
                if (attrs.redirect) { step.redirect = attrs.redirect; }
                if (attrs.orphan) { step.orphan = attrs.orphan; }
                if (attrs.reflex) { step.reflex = attrs.reflex; }

                //Pass interpolated values through
                attrs.$observe('content', function (content) {
                    step.content = content;
                });
                attrs.$observe('title', function (title) {
                    step.content = title;
                });

                //Attach event handlers
                TourHelpers.attachEventHandlers(scope, attrs, step, events);

                //Compile templates
                TourHelpers.attachTemplate(scope, attrs, step);

                //Check whether or not the step should be skipped
                function stepIsSkipped() {
                    if (attrs.skip) {
                        return scope.$eval(attrs.skip);
                    }
                    return false;
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
