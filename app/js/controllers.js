function HomeCtrl($scope) {
  $scope.things = new kendo.data.DataSource({
    transport: {
      read: "app/data/products.json"
    },
    pageSize: 5
  });

  // to demonstrate event hanlding
  $scope.rowSelected = function(e) {
    var grid = e.sender;
    var selectedRows = grid.select();
    for (var i = 0; i < selectedRows.length; i++) {
      $scope.selectedItem = grid.dataItem(selectedRows[i]);
      break;
    }
  };

  $scope.chartSettings = {
    type: 'line'
  };

  $scope.chartData = [{
        name: "Total Visits",
        data: [56000, 63000, 74000, 91000, 117000, 138000]
    }, {
        name: "Unique visitors",
        data: [52000, 34000, 23000, 48000, 67000, 83000]
    }];

  $scope.series = [{
    type: "pie",
    startAngle: 150,
    data: [{
        category: "Asia",
        value: 53.8,
        color: "#9de219"
    },{
        category: "Europe",
        value: 16.1,
        color: "#90cc38"
    },{
        category: "Latin America",
        value: 11.3,
        color: "#068c35"
    },{
        category: "Africa",
        value: 9.6,
        color: "#006634"
    },{
        category: "Middle East",
        value: 5.2,
        color: "#004d38"
    },{
        category: "North America",
        value: 3.6,
        color: "#033939"
    }]
  }];

  
}

function SettingsCtrl($scope) {
  
}