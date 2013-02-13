angular.module("kendo").directive("kendoCalendar", function() {

  return {
    restrict: "E",
    link: function(scope, element, attrs) {
      element.kendoCalendar();
    }
  };

});