angular.module('SampleApp', [ 'kendo.directives' ]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/home', { templateUrl: 'app/partials/home.html',   controller: HomeCtrl }).
      when('/docs', { templateUrl: 'app/partials/docs.html', controller: SettingsCtrl }).
      when('/intro', { templateUrl: 'app/partials/intro.html' }).
      otherwise({redirectTo: '/intro'});
}]);

