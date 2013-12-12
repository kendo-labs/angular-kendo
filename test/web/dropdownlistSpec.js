describe('dropdownlist', function() {

  var $scope, $compile, $timeout;
  var elementFromNGOptions, elementFromOptions, elementFromStatic, elementFromRemote;

  beforeEach(module('kendo.directives'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_) {
    $compile = _$compile_;
    $scope = _$rootScope_;
    $timeout = _$timeout_;

    elementFromStatic = angular.element(
      "<select kendo-drop-down-list k-option-label=\"'Select A Thing'\">" +
        "<option value='0'>Thing 1</option/>" +
        "<option value='1'>Thing 2</option/>" +
      "</select>"
    );

    elementFromNGOptions = angular.element(
      "<select kendo-drop-down-list='widget' data-value-field='value' id='dropdownlist' ng-model='thing' ng-options='t.name for thing in things'></select>"
    ); 

    elementFromRemote = angular.element(
      "<select kendo-drop-down-list k-data-source='things' k-data-text-field='name' k-data-value-field='value'></select>"
    );

    $scope.things = [
      { name: "Thing 1", value: 1 },
      { name: "Thing 2", value: 2 }
    ];

    $scope.thing = $scope.things[0];

    $scope.widget = null;

  }));

  function dropdown(element) {
    $compile(element)($scope);
    $scope.$digest();
    $timeout.flush();
    return element;
  }

  it("should be a Kendo UI DropDownList when initialized from a static select", function() {
    var elm = dropdown(elementFromStatic);
    expect(elm.data("role")).toEqual("dropdownlist");
  });  

  it("should contain 3 items when initialized from a static select with option label", function() {
    var elm = dropdown(elementFromStatic);
    expect(elm.children().length).toEqual(3);
  });

  it("should have an initial value of 0", function() {
    var elm = dropdown(elementFromStatic);
    var widget = elm.getKendoDropDownList();
    expect(widget.value()).toEqual('0');
  }); 

  it("should be a Kendo UI DropDownList when initialized from ng-options", function() {
    var elm = dropdown(elementFromNGOptions);
    debugger;
    expect(elm.data("role")).toEqual("dropdownlist");
  });

  it("should store a reference to itself on the scope", function() {
    var elm = dropdown(elementFromNGOptions);
    expect($scope.widget).toNotEqual(null);
  });

  /* FAILING: setting the value doesn't work since ng-options wants the entire
              object. this appears to fail with a straight HTML select asw well */
  // it("should change the value of the dropdown list if the model value changes", function() {
  //   var elm = dropdown(elementFromNGOptions);
  //   var widget = elm.getKendoDropDownList();

  //   $scope.$apply(function() {
  //     $scope.thing = $scope.things[1];
  //   });

  //   expect(widget.value()).toEqual("2");
  // });

  it("it should be a Kendo UI dropdown list when initialized with a DataSource", function() {
    var elm = dropdown(elementFromRemote);
    expect(elm.data("role")).toEqual("dropdownlist");
  });

  it("should destroy itself", function() {
    var widget = dropdown(elementFromStatic).data("kendoDropDownList");
    widget.destroy();
  });

});