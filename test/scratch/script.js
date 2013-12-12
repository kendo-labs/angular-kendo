






angular.module('test', ['kendo.directives'])
            .config(function ($routeProvider) {
                $routeProvider.when("/test1", {
                    controller: "test",
                    templateUrl: "scratch/testPart1.html"
                })
                $routeProvider.when("/test2", {
                    controller: "test2",
                    templateUrl: "scratch/testPart2.html"
                })
                 $routeProvider.otherwise({ redirectTo: "/test1" });
            })
            .controller('test', function ($scope) {
                $scope.foo = function () {
                    $scope.testWindow1.open();
                }

            })
            .controller('test2', function ($scope) {
                $scope.boo = function () {
                    $scope.testWindow2.open();
                }

            });