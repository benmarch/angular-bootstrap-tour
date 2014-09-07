/* global Tour: false */

/**
 * @file angular-bootstrap-tour is micro-library.
 * Scaffolded with generator-microjs
 * @author  <Ben March>
 */


(function angularBootstrapTour(app) {
    'use strict';

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

    function attachEventHandlers(scope, attrs, options) {

        if (attrs.onShow) {
            options.onShow = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onShow);
                });
            };
        }
        if (attrs.onShown) {
            options.onHide = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onShown);
                });
            };
        }
        if (attrs.onHide) {
            options.onHide = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onHide);
                });
            };
        }
        if (attrs.onHidden) {
            options.onHiden = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onHiden);
                });
            };
        }
        if (attrs.onNext) {
            options.onNext = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onNext);
                });
            };
        }
        if (attrs.onPrev) {
            options.onPrev = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onPrev);
                });
            };
        }
        if (attrs.onPause) {
            options.onPause = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onPause);
                });
            };
        }
        if (attrs.onResume) {
            options.onResume = function (tour) {
                safeApply(scope, function () {
                    scope.$eval(attrs.onResume);
                });
            };
        }

    }

    app.controller('TourController', ['$filter', function ($filter) {

        var self = this,
            steps = [],
            tour;

        function orderSteps(steps) {
            var ordered = $filter('orderBy')(steps, 'order');

            angular.forEach(ordered, function (step, index) {
                step.next = index + 1;
                step.prev = index - 1;
            });

            return ordered;
        }

        function refreshTour() {
            if (tour) {
                tour._options.steps = [];
                tour.addSteps(orderSteps(steps));
            }
        }

        self.addStep = function (step) {
            if (~steps.indexOf(step)) {
                return;
            }

            steps.push(step);
            refreshTour();
        };

        self.removeStep = function (step) {
            if (!~steps.indexOf(step)) {
                return;
            }

            steps.splice(steps.indexOf(step), 1);
            refreshTour();
        };

        self.getSteps = function () {
            return steps;
        };

        self.init = function (options) {
            options.steps = orderSteps(steps);
            tour = new Tour(options);
            return tour;
        };


    }]);

    app.directive('tour', [function () {

        return {
            restrict: 'EA',
            scope: true,
            controller: 'TourController',
            link: function (scope, element, attrs, ctrl) {

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
                };

                attachEventHandlers(scope, attrs, options);

                if (attrs.onStart) {
                    options.onStart = function (tour) {
                        safeApply(scope, function () {
                            scope.$eval(attrs.onStart);
                        });
                    };
                }
                if (attrs.onEnd) {
                    options.onEnd = function (tour) {
                        safeApply(scope, function () {
                            scope.$eval(attrs.onEnd);
                        });
                    };
                }
                if (attrs.afterGetState) {
                    options.afterGetState = function (key, value) {
                        safeApply(scope, function () {
                            scope.$eval(attrs.afterGetState).call(scope.tour, key, value);
                        });
                    };
                }
                if (attrs.afterSetState) {
                    options.afterSetState = function (key, value) {
                        safeApply(scope, function () {
                            scope.$eval(attrs.afterSetState).call(scope.tour, key, value);
                        });
                    };
                }
                if (attrs.afterRemoveState) {
                    options.afterRemoveState = function (key, value) {
                        safeApply(scope, function () {
                            scope.$eval(attrs.afterRemoveState).call(scope.tour, key, value);
                        });
                    };
                }

                scope.$watchCollection(ctrl.getSteps, function (steps) {
                    scope.stepCount = steps.length;
                });

                if (attrs.tourOptions) {
                    angular.extend(options, scope.$eval(attrs.tourOptions));
                }

                scope.tour = ctrl.init(options);

            }
        };

    }]);

    app.directive('tourStep', [function () {

        return {
            restrict: 'EA',
            scope: true,
            require: '^tour',
            link: function (scope, element, attrs, ctrl) {

                var step = {
                    element: element,
                    order: attrs.order || 0
                };

                if (attrs.placement) { step.placement = attrs.placement; }
                if (attrs.backdrop) { step.backdrop = attrs.backdrop; }
                if (attrs.orphan) { step.orphan = attrs.orphan; }
                if (attrs.reflex) { step.reflex = attrs.reflex; }

                attachEventHandlers(scope, attrs, step);

                attrs.$observe('content', function (content) {
                    step.content = content;
                });

                attrs.$observe('title', function (title) {
                    step.content = title;
                });


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


                if (attrs.options) {
                    angular.extend(step, scope.$eval(attrs.options));
                }

                ctrl.addStep(step);

            }
        };

    }]);

}(angular.module('bm.bsTour', [])));
