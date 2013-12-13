(function(angular) {

  var module = angular.module('kendo.directives', []),
               parse, timeout, compile, log;

  var factories = {

    dataSource: (function() {

      var types = {
        TreeView: 'HierarchicalDataSource',
        Scheduler: 'SchedulerDataSource'
      };

      var toDataSource = function(dataSource, type) {
        return kendo.data[type].create(dataSource);
      };

      var init = function(scope, element, attrs, role) {

        var type = types[role] || 'DataSource';

        var ds = toDataSource(scope.$eval(attrs.kDataSource), type);

        // // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
        // // directive and provide this data on the element.
        element.data('$kendoDataSource', ds);

        // // Keep the element's data up-to-date with changes.
        scope.$watch(attrs.kDataSource, function(mew, old){
          if(mew !== old) {
            element.data('$kendoDataSource', 
              toDataSource(type, mew)
            );
          }
        });

        return ds;

      };

      return { create: init };

    }()),

    widget: (function() {

      var scope, element, attrs, widget;

      var ignoredAttributes = {
        kDataSource: true,
        kOptions: true,
        kRebind: true
      };

      var processAttr = function(options, attr) {

        var exp = /k(On)?([A-Z].*)/,
            match, optionName, fn;

        if (ignoredAttributes[attr.name]) {
          return;
        }

        match = attr.name.match(exp);

        if( match ) {

          optionName = match[2].charAt(0).toLowerCase() + match[2].slice(1);

          if( match[1] ) {
            
            fn = parse(attr.value);

            options[optionName] = function(e) {
              
              if(scope.$root.$$phase === '$apply' || scope.$root.$$phase === '$digest') {
            
                fn({kendoEvent: e});
            
              } else {
            
                scope.$apply(function() {
            
                  fn(scope, {kendoEvent: e});
            
                });
              }
            };

          } else {
            
            options[optionName] = angular.copy(scope.$eval(attr.value));
            
            if( options[optionName] === undefined && attr.value.match(/^\w*$/) ) {

              log.warn(widget + '\'s ' + attr.name + ' attribute resolved to undefined. Maybe you meant to use a string literal like: \'' + attr.value + '\'?');
            
            }
          }
        }
      };

      var gatherOptions = function() {

        var options;

        options = angular.element.extend(true, {}, scope.$eval(attrs.kOptions));

        $.each(attrs, function(name, value) {
          processAttr(options, { name: name, value: value });
        });

        options.dataSource = element.inheritedData('$kendoDataSource') || options.dataSource;

        return options;

      };

      var init = function($scope, $element, $attrs, $widget) {

        scope = $scope;
        element = $element;
        widget = $widget;
        attrs = $attrs;

        var options = gatherOptions();
        var role = widget.replace('kendo', '');

        // parse the datasource attribute
        if (attrs.kDataSource) {
          options.dataSource = factories.dataSource.create(scope, element, attrs, role);
        }

        if (spackle[role]) {
          spackle[role](scope, element, options, attrs);
        }

        return element[widget](options).data(widget);

      };

      return { create: init };

    }())
  };

  var spackle = {

    Grid: function(scope, element, options, attrs) {

      options.dataBound = function() {

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
          rowScope.dataItem = grid.dataItem(row);

          // compile the row. You can now use angular templates in that row.
          compile(row)(rowScope);
        });
      };

      options.dataBinding = function() {

        var rows = element.data('kendoGrid').tbody.children('tr.ng-scope');

        // here we need to destroy the scopes that we created in dataBound handler to make sure no scopes are leaked.
        rows.each(function(index, rowElement) {
          var rowScope = angular.element(rowElement).scope();
          // destroy the scope
          rowScope.$destroy();
        });
      };

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
          var changeExpFn = parse(attrs.kOnChange);
          changeExpFn(scope, locals);
        });
      };

    }
  };

  module.factory('directiveFactory', ['$timeout', '$parse', '$compile', '$log',
    function($timeout, $parse, $compile, $log) {

      timeout = $timeout;
      parse = $parse;
      compile = $compile;
      log = $log;

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
      var unsetTimeoutPromise = function() { $timeoutPromise = null; };

      var create = function(role) {

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

            timeout(function() {
              
              var widget = factories.widget.create(scope, element, attrs, role);

              exposeWidget(widget, scope, attrs, role);

              // if k-rebind attribute is provided, rebind the kendo widget when
              // the watched value changes
              if( attrs.kRebind ) {
                // watch for changes on the expression passed in the k-rebind attribute
                scope.$watch(attrs.kRebind, function(newValue, oldValue) {
                  if(newValue !== oldValue) {
                    // create the kendo widget and bind it to the element.
                    widget = factories.widget.create(scope, element, attrs, role);
                    exposeWidget(widget, scope, attrs, role);
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
                  throw new Error('ng-model used but ' + role + ' does not define a value accessor');
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
  

  // create directives for every widget.
  angular.forEach([ kendo.ui, kendo.dataviz && kendo.dataviz.ui ], function(namespace) {
    angular.forEach(namespace, function(value, key) {
      if (key.match(/^[A-Z]/) && key !== 'Widget') {
        var widget = "kendo" + key;
        module.directive(widget, [
          "directiveFactory",
          function(directiveFactory) {
            return directiveFactory.create(widget);
          }
        ]);
      }
    });
  });

}(angular));

// Local Variables:
// js-indent-level: 2
// js2-basic-offset: 2
  // End:
