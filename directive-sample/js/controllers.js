function HomeCtrl($scope) {
  $scope.model = kendo.observable({
    products: new kendo.data.DataSource({
      transport: {
        read: "directive-sample/data/products.json"
      },
      pageSize: 5
    })
  });
}