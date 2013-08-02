// ## The kendoSource directive allows setting the Kendo UI DataSource of a widget directly from the HTML.
angular.module('kendo.directives').directive('kDataSource', [function() {

  // Transforms the object into a Kendo UI DataSource.
  var toDataSource = function(ds) {
    // TODO: if ds is a $resource, wrap it in a kendo dataSource using an injected service
     return kendo.data.DataSource.create(ds);
  };

  return {
    // This is an attribute directive
    restrict: 'A',
    controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {

      // can we intercept the data source
      var ds = $scope.$eval($attrs.kDataSource);

      // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
      // directive and provide this data on the element.
      $element.data('$kendoDataSource', toDataSource(ds));

      // if this data source is set to an array, we need to add a watch to keep the widget in sync
      if ($.isArray(ds)) {
        // add a watch to the array (value comparison: true)
        $scope.$watch($attrs.kDataSource, function(oldVal, newVal) {
          // if the array values differ
          if (oldVal !== newVal) {
            // get a reference to the widget
            var widget = widgetInstance($element);
            // if the widget exists and has a dataSource
            if (widget && widget.dataSource) {
              // read the data again which updates the widget
              widget.dataSource.read();
            }
          }
        }, true);
      }
    }]
  };

}]);