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
