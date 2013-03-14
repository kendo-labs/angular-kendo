"use strict";

// add a namespace for the kendo directive
angular.module("kendo.directives", []);

// simple directive just binds or inits any element with a data-kendo attr
angular.module("kendo.directives").directive("kendo", function() {

  // init or bind depending on whether or not a bind attr was specified
  var initOrBind = function(scope, element, attrs) {
    if (attrs.bind) {
      kendo.bind(element, scope[attrs.model]);
    }
    else {
      kendo.init(element);
    }
  };

  return {
    require: "?ngModel",
    restrict: "A,E",
    transclude: true,
    link: function(scope, element, attrs, ngModel) {
      // if this element is also bound to a model
      if (ngModel) {
        // delay the binding until model render which gives
        // angular enough time to update the DOM prior
        ngModel.$render(function() {
          initOrBind(scope, element, attrs);
        });
      }
      // otherwise bind away
      else {
        initOrBind(scope, element, attrs);
      }

      // bind to the destroy method and unbind with kendo
      element.bind("$destroy", function() {
        kendo.unbind(element);
      });
    }
  };


});