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
      // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
      // directive and provide this data on the element.
      $element.data('$kendoDataSource', toDataSource($scope.$eval($attrs.kDataSource)));

      // Keep the element's data up-to-date with changes.
      $scope.$watch($attrs.kDataSource, function(newDS, oldDS) {
        if( newDS !== oldDS ) {
          $element.data('$kendoDataSource', toDataSource(newDS));
        }
      });
    }]
  };

}]);