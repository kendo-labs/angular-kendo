// describe('autocomplete', function() {

//   var $scope, $compile, $timeout;
//   var input;

//   beforeEach(module('kendo.directives'));

//   beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_) {
//     $compile = _$compile_;
//     $scope = _$rootScope_;
//     $timeout = _$timeout_;

//     input = "<input kendo-auto-complete>";

//     $scope.countries = [
//       "Albania",
//       "Andorra",
//       "Armenia",
//       "Austria",
//       "Azerbaijan",
//     ];

//   }));

//   function init(element) {
//     $compile(element)($scope);
//     $scope.$digest();
//     $timeout.flush();
//     return element;
//   }

//   it("should be a Kendo UI AutoComplete", function() {
//     var widget = init(input);
//     expect(widget.data("role")).toEqual("AutoComplete");
//   });

// });