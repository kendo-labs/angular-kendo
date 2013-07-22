function HomeCtrl($scope) {

  $scope.products = new kendo.data.DataSource({
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

  $scope.things = {
    data: [{ name: "Thing 1", id: 1 },
           { name: "Thing 2", id: 2 },
           { name: "Thing 3", id: 3 }]
  };

  $scope.thingsOptions = {
    dataSource: {
      data: [{ name: "Thing 1", id: 1 },
             { name: "Thing 2", id: 2 },
             { name: "Thing 3", id: 3 }]
    },
    dataTextField: "name",
    dataValueField: "id",
    optionLabel: "Select A Thing"
  };

  $scope.thingsChange = function(e) {
    console.log(e.sender.text());
  };

  $scope.window = {
    open: function() {
      $scope.modal.center().open();
    }
  };

  $scope.files = new kendo.data.DataSource({
    transport: {
      read: "app/data/files.json"
    }
  });

  $scope.chartSettings = {
    type: 'line'
  };

  $scope.column = {
    title: {
      text: "Site Visitors Stats /thousands/"
    },
    legend: {
      visible: false
    },
    seriesDefaults: {
      type: "column"
    },
    series: [{
        name: "Total Visits",
        data: [56000, 63000, 74000 ]
      },
      {
        name: "Unique visitors",
        data: [52000, 34000, 23000 ]
    }],
    valueAxis: {
      max: 100000,
      line: {
        visible: false
      },
      minorGridLines: {
        visible: true
      }
    },
    categoryAxis: {
      categories: ["Jan", "Feb", "Mar" ],
      majorGridLines: {
        visible: false
      }
    },
    tooltip: {
      visible: true,
      template: "#= series.name #: #= value #"
    },
    chartArea: {
      background: ""
    }
  };


  $scope.pie = ({
    title: {
      position: "bottom",
      text: "Share of Internet Population Growth"
    },
    legend: {
      visible: false
    },
    chartArea: {
      background: ""
    },
    seriesDefaults: {
      labels: {
        visible: true,
        background: "transparent",
        template: "#= category #: #= value#%"
      }
    },
    series: [{
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
    }],
    tooltip: {
      visible: true,
      format: "{0}%"
    }
  });

  // apply pretty print
  $scope.$on('$viewContentLoaded', function() {
    window.prettyPrint();
  });

}

function SettingsCtrl($scope) {

}