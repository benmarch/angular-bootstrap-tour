/* global angular: false */

(function angularBootstrapTour(app) {
    'use strict';

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

}(angular.module('bm.bsTour')));
