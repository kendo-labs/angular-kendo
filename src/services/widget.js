angular.module('kendo.directives', [], function($provide){

  // Iterate over the kendo.ui and kendo.dataviz.ui namespace objects to get the Kendo UI widgets adding
  // them to the 'widgets' array.
  var widgets = [];

  angular.forEach([kendo.ui, kendo.dataviz && kendo.dataviz.ui], function(namespace) {
    angular.forEach(namespace, function(value, key) {
      // add all widgets
      if( key.match(/^[A-Z]/) ){
        widgets.push("kendo" + key);
      }
    });
  });

  $provide.value('kendoWidgets', widgets);

});
