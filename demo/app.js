(function (app) {

    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/docs', {
                templateUrl: 'views/docs.html',
                controller: function ($scope) {
                    $scope.viewName = 'docs';
                }
            })
            .when('/other', {
                templateUrl: 'views/other.html',
                controller: function ($scope) {
                    $scope.viewName = 'other';
                }
            })
            .otherwise({
                redirectTo: '/docs'
            });

    }]);

}(angular.module('app', ['bm.bsTour', 'ngRoute'])));
