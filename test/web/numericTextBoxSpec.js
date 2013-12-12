describe('numerictextbox', function() {

  var $scope, $compile, $timeout;
  var input;

  beforeEach(module('kendo.directives'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_) {
    $compile = _$compile_;
    $scope = _$rootScope_;
    $timeout = _$timeout_;

    input = angular.element("<input kendo-numeric-text-box ng-model='value' />");

    $scope.value = 0;

  }));

  function init(element) {
    $compile(element)($scope);
    $scope.$digest();
    $timeout.flush();
    return element;
  }

  it("should be a Kendo UI NumericTextBox", function() {
    var widget = init(input).data("kendoNumericTextBox");
    expect(widget.options.name).toEqual("NumericTextBox");
  });

  it("should update the model when the spin event is fired", function() {
    var widget = init(input).data("kendoNumericTextBox");
    widget._step(1);
  });

});