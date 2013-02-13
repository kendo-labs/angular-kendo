// angular.module("kendo.config", []).value("kendo.config", {});
angular.module("kendo.directives", []);
// angular.module("kendo", [ "kendo.directives", "kendo.config" ]);

angular.module("kendo.directives").directive("kendo", function() {

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
    link: function(scope, element, attrs, ngModel) {
      // check for a bind and pass the model if necessary
      if (ngModel) {
        ngModel.$render(function() {
          initOrBind(scope, element, attrs);
        });
      }
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