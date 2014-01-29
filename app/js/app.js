angular.module('SampleApp', [ 'kendo.directives', 'ngRoute' ]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', { templateUrl: 'app/partials/home.html',   controller: HomeCtrl }).
      otherwise({redirectTo: '/'});
}]);

