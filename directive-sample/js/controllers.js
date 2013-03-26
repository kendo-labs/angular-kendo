function HomeCtrl($scope) {
  $scope.things = new kendo.data.DataSource({
	transport: {
      read: "directive-sample/data/products.json"
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
  }
}