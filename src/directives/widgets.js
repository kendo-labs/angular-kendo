(function(angular) {

  angular.module('kendo.directives').run([ 'kendoWidgets', function(widgets) {
		// loop through all the widgets and create a directive
		angular.forEach(widgets, function(widget) {
			angular.module('kendo.directives').directive(widget, ['directiveFactory',
				function(directiveFactory) {
					return directiveFactory.create(widget);
				}
			]);
		});

	} ]);

}(angular));

