// ## The kendoSource directive allows setting the Kendo UI DataSource of a widget directly from the HTML.
angular.module('kendo.directives').directive('kDataSource', [function(){
  return {
    // This is an attribute directive
    restrict: 'A',
    controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element){
      var widgetType = getWidgetType($attrs);
      var dataSourceType = getDataSourceType(widgetType);

      // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
      // directive and provide this data on the element.
      $element.data('$kendoDataSource', toDataSource($scope.$eval($attrs.kDataSource), dataSourceType));

      // Keep the element's data up-to-date with changes.
      $scope.$watch($attrs.kDataSource, function(newDataSource, oldDataSource){
        if(newDataSource !== oldDataSource){
          $element.data('$kendoDataSource', toDataSource(newDataSource, dataSourceType));
        }
      });
    }]
  };

  // Returns the DataSource type based on the widgetType
  function getDataSourceType(widgetType){
    var hierarchicalDataSourceWidgets = ['TreeView'];
    var schedulerDataSourceWidgets = ['Scheduler'];
        if(jQuery.inArray(widgetType, hierarchicalDataSourceWidgets) !== -1){
      return 'HierarchicalDataSource';
    }
    else if(jQuery.inArray(widgetType, schedulerDataSourceWidgets) !== -1){
      return 'SchedulerDataSource';
    }
    else{
      return 'DataSource';
    }
  }

  // Returns the widgetType, eg: 'TreeView'
  function getWidgetType(attributes){
    for(var attribute in attributes){
      if(attributes.hasOwnProperty(attribute) && attribute.match(/kendo/)){
        return attribute.replace('kendo', '');
      }
    }
  }

  // Transforms the object into a Kendo UI DataSource.
  function toDataSource(dataSource, dataSourceType){
    // TODO: if ds is a $resource, wrap it in a kendo dataSource using an injected service
    return kendo.data[dataSourceType].create(dataSource);
  }
}]);