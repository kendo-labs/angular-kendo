angular.module('SampleApp', [ 'kendo.directives' ]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/home', {templateUrl: 'partials/home.html',   controller: HomeCtrl}).
      when('/other', {templateUrl: 'partials/other.html', controller: OtherCtrl}).
      otherwise({redirectTo: '/home'});
}]);
