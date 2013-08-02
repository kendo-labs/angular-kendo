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
