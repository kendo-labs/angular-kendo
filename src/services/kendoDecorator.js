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
