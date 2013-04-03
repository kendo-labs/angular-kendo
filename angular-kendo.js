(function(angular, $, kendo) {
  
  // Use strict mode because it's totally hip.
  'use strict';
  
  // Create directives and services modules.
  var directives = angular.module('kendo.directives', []);
  var services = angular.module('kendo.services', []);

  // Create a new kendo module and pass in the directives and services
  var main = angular.module('kendo', ['kendo.directives', 'kendo.services']);

  var widgets = [];

  // Iterate over the $.fn object to get the Kendo UI widgets adding
  // them to the 'widgets' array.
  // TODO: This is HIDEOUS. how do we iterate the $.fn object without underscore?
  for(var item in $.fn) {
    if ($.fn.hasOwnProperty(item) && !!item.match(/^kendo(?:(?!Mobile))/)) {
      widgets.push(item);
    }
  }

  // Set up a value service containing the names of available Kendo UI Widgets.
  services.value('kendoWidgets', widgets);

  // Loop through the array of widget names and dynamically create a directive for each one.
  angular.forEach( widgets, function(kendoWidget) {
      directives.directive(kendoWidget, [ '$parse', '$timeout', function($parse, $timeout) {
          var options;
          return {
            // Parse the directive for attributes, elements and classes.
            restrict: 'ACE',
            transclude: true,
            require: ['?ngModel','?kendoSource', kendoWidget],
            controller: [ '$scope', '$attrs', '$element', '$transclude', function($scope, $attrs, $element, $transclude) {
              // The options expression is evaluated once
              this.options = angular.copy($scope.$eval($attrs[kendoWidget])) || {};
              $transclude(function(clone){
                $element.append(clone);
              });
            }],
            link: function(scope, element, attrs, ctrls) {
              // Widgets may be bound to the ng-model.
              var ngModel = ctrls[0],
              // They may also specify their datasource as an object on the scope.
                  kendoSource = ctrls[1], widget,
              // Getting a reference on the options object defined in the controller
                  options = ctrls[2].options;

              // Bind kendo widget to element only once interpolation on attributes is done.
              $timeout( function() {
                
                // Mixin the data that's set on the element in the options
                angular.extend(options, element.data());
                
                // If the kendo-source directive is present, use it to create or retrieve an instance of the Kendo UI DataSource.
                if( kendoSource ) {
                  options.dataSource = kendoSource.getDataSource();
                }
                
                // Add on-* event handlers to options.
                addEventHandlers(options, scope, attrs);
                
                // Bind the kendo widget to the element and store a reference to the widget.
                widget = element[kendoWidget](options).data(kendoWidget);

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
                    widget.value(ngModel.$viewValue);
                  };
                  
                  // In order to be able to update the angular scope objects, we need to know when the change event is fired for a Kendo UI Widget.
                  widget.bind("change", function(e) {
                    scope.$apply(function() {
                      // Set the value on the scope to the widget value. 
                      ngModel.$setViewValue(widget.value());
                    });
                  });
                }
              });           
            }
          };

          // Simplistic reduce function
          function reduce(obj, cb, memo) {
            angular.forEach(obj, function(value, key) {
              memo = cb.call(value, memo, value, key);
            });
            return memo;
          }

          // Create an event handler function for each on-* attribute on the element and add to dest.
          function addEventHandlers(dest, scope, attrs) {
            var memo,
                eventHandlers = reduce(attrs, function(memo, attValue, att) {
              var match = att.match(/^on(.+)/), eventName, fn;
              if( match ) {
                // Lowercase the first letter to match the event name kendo expects.
                eventName = match[1].charAt(0).toLowerCase() + match[1].slice(1);
                // Parse the expression.
                fn = $parse(attValue);
                // Add a kendo event listener to the memo.
                memo[eventName] = function(e) {
                  // Make sure this gets invoked in the angularjs lifecycle.
                  scope.$apply(function() {
                    // Invoke the parsed expression with a kendoEvent local that the expression can use.
                    fn(scope, {kendoEvent: e});
                  });
                };
              }
              return memo;
            }, {});

            // mix the eventHandlers in the options object
            angular.extend(dest, eventHandlers);
          }

      }] );
  });


  // ## The kendoSource directive allows setting the Kendo UI DataSource of a widget directly from the HTML.
  directives.directive('kendoSource', [function() {
    return {
      restrict: 'A',
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        // Create the DataSource or return the current instance.
        var dataSource = toDataSource($scope.$eval($attrs.kendoSource));
        // Reference equality watch.
        $scope.$watch($attrs.kendoSource, function(ds) {
          dataSource = toDataSource(ds);
        });
                      
        // TODO: Not sure what is happening here
        this.getDataSource = function() {
          return dataSource;
        };
      }]
        
    };

    // Transforms the object into a Kendo UI DataSource.
    function toDataSource(ds) {
    
      return kendo.data.DataSource.create(ds);

    //   if( ds instanceof kendo.data.DataSource ) {
    //     return ds;
    //   } else if( angular.isObject(ds) ) {
    //     return new kendo.data.DataSource(ds);
    //   } else if( angular.isArray(ds) ) {
    //     return new kendo.data.DataSource({
    //       data: ds
    //     });
    //   } else {
    //     throw new Error('kendo-source must be a kendo datasource object');
    //   }
    }

  }]);

})(angular, jQuery, kendo);