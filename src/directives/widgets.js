(function(angular) {

  var widgets = angular.injector(['kendo.directives']).get('widgets');

  // loop through all the widgets and create a directive
  angular.forEach(widgets, function(widget) {
    angular.module('kendo.directives').directive(widget, ['$parse', '$timeout', 'directiveFactory',
      function($parse, $timeout, directiveFactory) {
        return directiveFactory.create($parse, $timeout, widget);
      }
    ]);
  });

}(angular));

