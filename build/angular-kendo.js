(function(angular) {'use strict';

// declare all the module
angular.module('kendo.directives', []);
angular.module('kendo.directives', [], ['$provide', function($provide){

  // Iterate over the kendo.ui and kendo.dataviz.ui namespace objects to get the Kendo UI widgets adding
  // them to the 'widgets' array.
  var widgets = [];

  angular.forEach([kendo.ui, kendo.dataviz && kendo.dataviz.ui], function(namespace) {
    angular.forEach(namespace, function(value, key) {
      // add all widgets
      if( key.match(/^[A-Z]/) && key !== 'Widget' ){
        widgets.push("kendo" + key);
      }
    });
  });

  $provide.value('kendoWidgets', widgets);

}]);

angular.module('kendo.directives').provider('kendoDecorator', [ function() {
  var provider = this, DECORATORS = '$kendoOptionsDecorators';

  var globalOptionsDecorators = {};

  // add an options decorator to be applied on all specified widget, not specific instances
  provider.addGlobalOptionsDecorator = function(widgetName, decorator) {
    if( angular.isString(widgetName) && angular.isFunction(decorator) ) {
      globalOptionsDecorators[widgetName] = globalOptionsDecorators[widgetName] || [];
      globalOptionsDecorators[widgetName].push(decorator);
      return function() {
          globalOptionsDecorators[widgetName].splice(globalOptionsDecorators[widgetName].indexOf(decorator), 1);
        };
    }
    throw new Error('Illegal Arguments');
  };

  // get the global list of options decorators for a specified widget. Useful for ordering
  provider.getGlobalOptionsDecorator = function(widgetName) {
    return globalOptionsDecorators[widgetName] || [];
  };

  provider.$get = [function() {

    // returns the decorators associated to the specified element
    function getOptionsDecorators(element) {
      var decorators = element.data(DECORATORS);
      if( !angular.isArray(decorators) ) {
        decorators = [];
        element.data(DECORATORS, decorators);
      }
      return decorators;
    }

    function invokeDecorators(element, decorators, opts) {
      for( var i = 0; i < decorators.length; i++ ) {
        decorators[i](element, opts);
      }
    }

    // invokes the provided element's decorators and global operators on the provided options object.
    function decorateOptions(element, widgetName, opts) {
      var i, decorators = provider.getGlobalOptionsDecorator(widgetName);
      invokeDecorators(element, decorators, opts);

      // get decorators for element
      decorators = element.data(DECORATORS) || [];
      invokeDecorators(element, decorators, opts);
    }

    function addOptionsDecorator(element, decorator) {
      if( angular.isFunction(decorator) ) {
        var decorators = getOptionsDecorators(element);
        decorators.push(decorator);
        return function() {
          decorators.splice(decorators.indexOf(decorator), 1);
        };
      }
    }

    return {
        getOptionsDecorator: getOptionsDecorators,
        addOptionsDecorator: addOptionsDecorator,
        decorateOptions: decorateOptions
      };
  }];

}]);

angular.module('kendo.directives').factory('widgetFactory', ['$parse', '$log', 'kendoDecorator', function($parse, $log, kendoDecorator) {

  // k-* attributes that should not be $parsed or $evaluated by gatherOptions
  var ignoredAttributes = {
    kDataSource: true,
    kOptions: true,
    kRebind: true
  };

  var mixin = function(kendoWidget, scope, options, attrName, attrValue) {

    // regexp for matching regular options attributes and event handler attributes
    // The first matching group will be defined only when the attribute starts by k-on- for event handlers.
    // The second matching group will contain the option name.
    var matchExp = /k(On)?([A-Z].*)/;

    // ignore attributes that do not map to widget configuration options
    if( ignoredAttributes[attrName] ) {
      return;
    }

    var match = attrName.match(matchExp), optionName, fn;

    if( match ) {
      // Lowercase the first letter to match the option name kendo expects.
      optionName = match[2].charAt(0).toLowerCase() + match[2].slice(1);

      if( match[1] ) {
        // This is an event handler attribute (k-on-*)
        // Parse the expression so that it get evaluated later.
        fn = $parse(attrValue);
        // Add a kendo event listener to the options.
        options[optionName] = function(e) {
          // Make sure this gets invoked in the angularjs lifecycle.
          if(scope.$root.$$phase === '$apply' || scope.$root.$$phase === '$digest') {
            fn({kendoEvent: e});
          } else {
            scope.$apply(function() {
              // Invoke the parsed expression with a kendoEvent local that the expression can use.
              fn(scope, {kendoEvent: e});
            });
          }
        };
      } else {
        // Evaluate the angular expression and put its result in the widget's options object.
        // Here we make a copy because the kendo widgets make changes to the objects passed in the options
        // and kendo-refresh would not be able to refresh with the initial values otherwise.
        options[optionName] = angular.copy(scope.$eval(attrValue));
        if( options[optionName] === undefined && attrValue.match(/^\w*$/) ) {
          // if the user put a single word as the attribute value and the expression evaluates to undefined,
          // she may have wanted to use a string literal.
          $log.warn(kendoWidget + '\'s ' + attrName + ' attribute resolved to undefined. Maybe you meant to use a string literal like: \'' + attrValue + '\'?');
        }
      }
    }
  };

  // Gather the options from defaults and from attributes
  var gatherOptions = function(scope, element, attrs, kendoWidget) {
    // TODO: add kendoDefaults value service and use it to get a base options object?
    // var options = kendoDefaults[kendoWidget];

    // make a deep clone of the options object provided by the k-options attribute, if any.
    var options = angular.element.extend(true, {}, scope.$eval(attrs.kOptions));

    // Mixin the data from the element's k-* attributes in the options
    angular.forEach(attrs, function(value, name) {
      mixin(kendoWidget, scope, options, name, value);
    });

    // The kDataSource directive sets the $kendoDataSource data on the element it is put on.
    // A datasource set in this way takes precedence over the one that could have been provided in options object passed
    // in the directive's attribute and that is used as the initial options object.
    options.dataSource = element.inheritedData('$kendoDataSource') || options.dataSource;

    // decorate options, if any decorators have been registered on this element or any global ones are registered for
    // the kendo widget
    kendoDecorator.decorateOptions(element, kendoWidget, options);

    return options;

  };

  // Create the kendo widget with gathered options
  var create = function(scope, element, attrs, kendoWidget) {

    // Create the options object
    var options = gatherOptions(scope, element, attrs, kendoWidget);

    // Bind the kendo widget to the element and return a reference to the widget.
    return element[kendoWidget](options).data(kendoWidget);
  };

  return {
    create: create
  };

}]);

angular.module('kendo.directives').factory('directiveFactory', ['widgetFactory', '$timeout', '$parse',
  function(widgetFactory, $timeout, $parse) {

    function exposeWidget(widget, scope, attrs, kendoWidget) {
      if( attrs[kendoWidget] ) {
        // expose the widget object
        var set = $parse(attrs[kendoWidget]).assign;
        if( set ) {
          // set the value of the expression to the kendo widget object to expose its api
          set(scope, widget);
        } else {
          throw new Error( kendoWidget + ' attribute used but expression in it is not assignable: ' + attrs[kendoWidget]);
        }
      }
    }
	
	// $timeout tracking
	var $timeoutPromise = null;
	var unsetTimeoutPromise = function() { $timeoutPromise = null };

    var create = function(kendoWidget) {

      return {
        // Parse the directive for attributes and classes
        restrict: 'ACE',
        transclude: true,
        require: '?ngModel',
        scope: false,
        controller: [ '$scope', '$attrs', '$element', '$transclude', function($scope, $attrs, $element, $transclude) {

          // Make the element's contents available to the kendo widget to allow creating some widgets from existing elements.
          $transclude(function(clone){
            $element.append(clone);
          });

        }],

        link: function(scope, element, attrs, ngModel) {

          var widget;
		  
		  // Instead of having angular digest each component that needs to be setup
		  // Use the same timeout until the timeout has been executed, this will cause all
		  //   directives to be evaluated in the next cycle, instead of over multiple cycles.
		  if (!$timeoutPromise)
		    $timeoutPromise = $timeout(unsetTimeoutPromise);

          // Bind kendo widget to element only once interpolation on attributes is done.
          // Using a $timeout with no delay simply makes sure the function will be executed next in the event queue
          // after the current $digest cycle is finished. Other directives on the same element (select for example)
          // will have been processed, and interpolation will have happened on the attributes.
          $timeoutPromise.then( function() {

            // create the kendo widget and bind it to the element.
            widget = widgetFactory.create(scope, element, attrs, kendoWidget);

            exposeWidget(widget, scope, attrs, kendoWidget);

            // if k-rebind attribute is provided, rebind the kendo widget when
            // the watched value changes
            if( attrs.kRebind ) {
              // watch for changes on the expression passed in the k-rebind attribute
              scope.$watch(attrs.kRebind, function(newValue, oldValue) {
                if(newValue !== oldValue) {
                  // create the kendo widget and bind it to the element.
                  widget = widgetFactory.create(scope, element, attrs, kendoWidget);
                  exposeWidget(widget, scope, attrs, kendoWidget);
                }
              }, true); // watch for object equality. Use native or simple values.
            }

            // Cleanup after ourselves
            scope.$on( '$destroy', function() {
              widget.destroy();
            });

            // if ngModel is on the element, we setup bi-directional data binding
            if (ngModel) {
              if( !widget.value ) {
                throw new Error('ng-model used but ' + kendoWidget + ' does not define a value accessor');
              }

              // Angular will invoke $render when the view needs to be updated with the view value.
              ngModel.$render = function() {
                // Update the widget with the view value.
                widget.value(ngModel.$viewValue || null);
              };

              // if the model value is undefined, then we set the widget value to match ( == null/undefined )
              if (widget.value !== undefined) {
                widget.value(ngModel.$viewValue || null);
              }

              // In order to be able to update the angular scope objects, we need to know when the change event is fired for a Kendo UI Widget.
              widget.bind("change", function(e) {
                if(scope.$root.$$phase === '$apply' || scope.$root.$$phase === '$digest') {
                  ngModel.$setViewValue(widget.value());
                } else {
                  scope.$apply(function() {
                    ngModel.$setViewValue(widget.value());
                  });
                }
              });
            }
          });
        }
      };
    };

    return {
      create: create
    };
  }
]);

(function(angular) {

  var widgets = angular.injector(['kendo.directives']).get('kendoWidgets');

  // loop through all the widgets and create a directive
  angular.forEach(widgets, function(widget) {
    angular.module('kendo.directives').directive(widget, ['directiveFactory',
      function(directiveFactory) {
        return directiveFactory.create(widget);
      }
    ]);
  });

}(angular));


// ## The kendoSource directive allows setting the Kendo UI DataSource of a widget directly from the HTML.
angular.module('kendo.directives').directive('kDataSource', [function(){
  return {
    // This is an attribute directive
    restrict: 'A',
    controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element){
      var widgetType = getWidgetType($attrs);
      var dataSourceType = getDataSourceType(widgetType);

      // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
      // directive and provide this data on the element.
      $element.data('$kendoDataSource', toDataSource($scope.$eval($attrs.kDataSource), dataSourceType));

      // Keep the element's data up-to-date with changes.
      $scope.$watch($attrs.kDataSource, function(newDataSource, oldDataSource){
        if(newDataSource !== oldDataSource){
          $element.data('$kendoDataSource', toDataSource(newDataSource, dataSourceType));
        }
      });
    }]
  };

  // Returns the DataSource type based on the widgetType
  function getDataSourceType(widgetType){
    var hierarchicalDataSourceWidgets = ['TreeView'];
    var schedulerDataSourceWidgets = ['Scheduler'];
        if(jQuery.inArray(widgetType, hierarchicalDataSourceWidgets) !== -1){
      return 'HierarchicalDataSource';
    }
    else if(jQuery.inArray(widgetType, schedulerDataSourceWidgets) !== -1){
      return 'SchedulerDataSource';
    }
    else{
      return 'DataSource';
    }
  }

  // Returns the widgetType, eg: 'TreeView'
  function getWidgetType(attributes){
    for(var attribute in attributes){
      if(attributes.hasOwnProperty(attribute) && attribute.match(/kendo/)){
        return attribute.replace('kendo', '');
      }
    }
  }

  // Transforms the object into a Kendo UI DataSource.
  function toDataSource(dataSource, dataSourceType){
    // TODO: if ds is a $resource, wrap it in a kendo dataSource using an injected service
    return kendo.data[dataSourceType].create(dataSource);
  }
}]);
angular.module('kendo.directives').directive('kendoGrid', ['$compile', 'kendoDecorator', '$parse', function($compile, kendoDecorator, $parse) {

  function dataBoundHandler(scope, element, rowDataVar) {
    var grid = element.data('kendoGrid');
    var rows = grid.tbody.children('tr');

    // Here we mimic ng-repeat in that we create a scope for each row that we can then destroy in dataBinding event.
    // Creating a scope for each row ensures you don't leak scopes when the
    // kendo widget regenerates the dom on pagination for example.
    rows.each(function(index, row) {
      var rowScope = scope.$new();
      // provide index of the row using the same $index var as ngRepeat
      rowScope.$index = index;
      // provide the data object for that row in the scope
      rowScope[rowDataVar] = grid.dataItem(row);

      // compile the row. You can now use angular templates in that row.
      $compile(row)(rowScope);
    });
  }

  function dataBindingHandler(element) {
    // find all the rows that we compiled in dataBound handler
    var rows = element.data('kendoGrid').tbody.children('tr.ng-scope');

    // here we need to destroy the scopes that we created in dataBound handler to make sure no scopes are leaked.
    rows.each(function(index, rowElement) {
        var rowScope = angular.element(rowElement).scope();
        // destroy the scope
        rowScope.$destroy();
    });
  }

  function createCompileRowsDecorator(scope, rowDataVar) {
    return function(element, options) {
      // keep a reference on the original event callbacks
      var origDataBinding = options.dataBinding;
      var origDataBound = options.dataBound;

      // The kendoGrid invokes this handler after it has created row elements for the data.
      options.dataBound = function() {
        dataBoundHandler(scope, element, rowDataVar);

        // invoke the original dataBound handler, if any
        if(angular.isFunction(origDataBound)) {
          origDataBound();
        }
      };

      // The kendoGrid invokes this handler before it creates new rows in the dom
      options.dataBinding = function() {
        dataBindingHandler(element);
        // invoke the original dataBinding handler, if any
        if(angular.isFunction(origDataBinding)) {
          origDataBinding();
        }
      };

    };
  }

  function createChangeDecorator(scope, changeExpFn) {
    return function(element, options) {
      options.change = function(e) {
        var cell, multiple, locals = { kendoEvent: e }, elems, items, columns, colIdx;
        if( angular.isString(options.selectable) ) {
          cell = options.selectable.indexOf('cell') !== -1;
          multiple = options.selectable.indexOf('multiple') !== -1;
        }

        elems = locals.selected = this.select();
        items = locals.data = [];
        columns = locals.columns = [];

        for (var i = 0; i < elems.length; i++) {
          var dataItem = this.dataItem(cell ? elems[i].parentNode : elems[i]);
          if( cell ) {
            if (angular.element.inArray(dataItem, items) < 0) {
              items.push(dataItem);
            }
            colIdx = angular.element(elems[i]).index();
            if (angular.element.inArray(colIdx, columns) < 0 ) {
              columns.push(colIdx);
            }
          } else {
            items.push(dataItem);
          }
        }

        if( !multiple ) {
          locals.data = items[0];
          locals.selected = elems[0];
        }

        // Make sure this gets invoked in the angularjs lifecycle.
        scope.$apply(function() {
          // Invoke the parsed expression with a kendoEvent local that the expression can use.
          changeExpFn(scope, locals);
        });
      };
    };
  }

  return {
    restrict: 'ACE',
    link: function(scope, element, attrs) {
      kendoDecorator.addOptionsDecorator(element, createCompileRowsDecorator(scope, 'dataItem'));

      // if k-on-change was defined, expose the selected rows/cells and not just the kendo event
      if( attrs.kOnChange ) {
        kendoDecorator.addOptionsDecorator(element, createChangeDecorator(scope, $parse(attrs.kOnChange)));
      }

    }
  };

}]);
}(angular));