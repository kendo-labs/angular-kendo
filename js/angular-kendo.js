(function(angular, _, jQuery, kendo) {
  "use strict";
  var main = angular.module('kendo', ['kendo.directives', 'kendo.services']);
  var directives = angular.module('kendo.directives', []);
  var services = angular.module('kendo.services', []);

  var widgets = _.filter(_.keys(jQuery.fn), function(prop){
    return !!prop.match(/^kendo(?:(?!Mobile))/);
  });

  // setting up a value service containing the names of available kendo widgets
  services.value('kendoWidgets', widgets);

  // here we create a directive for each kendo widgets
  angular.forEach( widgets, function(kendoWidget) {
      directives.directive(kendoWidget, [ '$parse', '$timeout', function($parse, $timeout) {
          var options;
          return {
            restrict: 'ACE',
            transclude: true,
            require: ['?ngModel','?kendoSource'],
            controller: [ '$scope', '$attrs', '$element', '$transclude', function($scope, $attrs, $element, $transclude) {
              // The options expression is evaluated once
              options = angular.copy($scope.$eval($attrs[kendoWidget])) || {};
              $transclude(function(clone){
                $element.append(clone);
              });
            }],
            link: function(scope, element, attrs, ctrls) {
              var ngModel = ctrls[0],
                  kendoSource = ctrls[1], widget;

              // bind kendo widget to element only once interpolation on attributes is done
              $timeout( function() {
                // mixing the data that's set on the element in the options
                angular.extend(options, element.data());
                
                if( kendoSource ) {
                  //override the datasource property received in options, if any
                  options.dataSource = kendoSource.getDataSource();
                }
                
                // add on-* event handlers to options
                addEventHandlers(options, scope, attrs);
                
                // bind the kendo widget to element and get a reference on the widget
                widget = element[kendoWidget](options).data(kendoWidget);

                // if ngModel is on the element, we setup bidi data binding
                if (ngModel) {
                  if( !widget.value ) {
                    throw new Error('ng-model used but ' + kendoWidget + ' does not define a value accessor');
                  }
                  // angular will invoke $render when the view 
                  // needs to be updated with the view value.
                  ngModel.$render = function() {
                    // udate the widget with the view value
                    widget.value(ngModel.$viewValue);
                  };
                  
                  // when the kendo widget's value changes...
                  widget.bind("change", function(e) {
                    // make sure this gets executed in the angularjs lifecycle
                    scope.$apply(function() {
                      // set the ngModel's view value 
                      ngModel.$setViewValue(widget.value());
                    });
                  });
                }
              });           
            }
          };

          // Create an event handler function for each on-* attribute on the element and add to dest.
          function addEventHandlers(dest, scope, attrs) {
            
            var eventHandlers = _.reduce(_.keys(attrs), function(memo, att) {
              var match = att.match(/^on(.+)/), eventName, fn;
              if( match ) {
                //lowercase the first letter
                eventName = match[1].charAt(0).toLowerCase() + match[1].slice(1);
                //parse the expression
                fn = $parse(attrs[att]);
                //add a kendo event listener to the memo
                memo[eventName] = function(e) {
                  // make sure this gets invoked in the angularjs lifecycle
                  scope.$apply(function() {
                    //invoke the parsed expression with a kendoEvent local that the expression can use.
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


  directives.directive('kendoSource', [function() {
    return {
      restrict: 'A',
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        var dataSource = toDataSource($scope.$eval($attrs.kendoSource));
        // reference equality watch
        $scope.$watch($attrs.kendoSource, function(ds) {
          dataSource = toDataSource(ds);
        });
                      
        this.getDataSource = function() {
          return dataSource;
        };
      }]
        
    };
    function toDataSource(ds) {
      if( ds instanceof kendo.data.DataSource ) {
        return ds;
      } else if( angular.isObject(ds) ) {
        return new kendo.data.DataSource(ds);
      } else if( angular.isArray(ds) ) {
        return new kendo.data.DataSource({
          data: ds
        });
      } else {
        throw new Error('kendo-source must be a kendo datasource object');
      }
    }

  }]);

})(angular, _, jQuery, kendo);