angular.module('SampleApp', [ 'kendo.directives' ]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', { templateUrl: 'app/partials/home.html',   controller: HomeCtrl }).
      otherwise({redirectTo: '/'});
}]);

