function HomeCtrl($scope) {
  $scope.model = kendo.observable({
    things: new kendo.data.DataSource({
      transport: {
        read: "data/products.json"
      },
      pageSize: 5
    })
  });
}

function OtherCtrl($scope) {


}