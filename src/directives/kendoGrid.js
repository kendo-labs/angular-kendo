angular.module('kendo.directives').directive('kendoGrid', ['$compile', 'kendoDecorator', '$parse', function($compile, kendoDecorator, $parse) {

  function dataBoundHandler(scope, element, rowDataVar) {
    var grid = element.data('kendoGrid');
    var rows = grid.tbody.children('tr');

    // Here we mimic ng-repeat in that we create a scope for each row that we can then destroy in dataBinding event.
    // Creating a scope for each row ensures you don't leak scopes when the
    // kendo widget regenerates the dom on pagination for example.
    rows.each(function(index, row) {
      var rowScope = scope.$new();
      // provide index of the row using the same $index var as ngRepeat
      rowScope.$index = index;
      // provide the data object for that row in the scope
      rowScope[rowDataVar] = grid.dataItem(row);

      // compile the row. You can now use angular templates in that row.
      $compile(row)(rowScope);
    });
  }

  function dataBindingHandler(element) {
    // find all the rows that we compiled in dataBound handler
    var rows = element.data('kendoGrid').tbody.children('tr.ng-scope');

    // here we need to destroy the scopes that we created in dataBound handler to make sure no scopes are leaked.
    rows.each(function(index, rowElement) {
        var rowScope = angular.element(rowElement).scope();
        // destroy the scope
        rowScope.$destroy();
    });
  }

  function createCompileRowsDecorator(scope, rowDataVar) {
    return function(element, options) {
      // keep a reference on the original event callbacks
      var origDataBinding = options.dataBinding;
      var origDataBound = options.dataBound;

      // The kendoGrid invokes this handler after it has created row elements for the data.
      options.dataBound = function() {
        dataBoundHandler(scope, element, rowDataVar);

        // invoke the original dataBound handler, if any
        if(angular.isFunction(origDataBound)) {
          origDataBound();
        }
      };

      // The kendoGrid invokes this handler before it creates new rows in the dom
      options.dataBinding = function() {
        dataBindingHandler(element);
        // invoke the original dataBinding handler, if any
        if(angular.isFunction(origDataBinding)) {
          origDataBinding();
        }
      };

    };
  }

  function createChangeDecorator(scope, changeExpFn) {
    return function(element, options) {
      options.change = function(e) {
        var cell, multiple, locals = { kendoEvent: e }, elems, items, columns, colIdx;
        if( angular.isString(options.selectable) ) {
          cell = options.selectable.indexOf('cell') !== -1;
          multiple = options.selectable.indexOf('multiple') !== -1;
        }

        elems = locals.selected = this.select();
        items = locals.data = [];
        columns = locals.columns = [];

        for (var i = 0; i < elems.length; i++) {
          var dataItem = this.dataItem(cell ? elems[i].parentNode : elems[i]);
          if( cell ) {
            if (angular.element.inArray(dataItem, items) < 0) {
              items.push(dataItem);
            }
            colIdx = angular.element(elems[i]).index();
            if (angular.element.inArray(colIdx, columns) < 0 ) {
              columns.push(colIdx);
            }
          } else {
            items.push(dataItem);
          }
        }

        if( !multiple ) {
          locals.data = items[0];
          locals.selected = elems[0];
        }

        // Make sure this gets invoked in the angularjs lifecycle.
        scope.$apply(function() {
          // Invoke the parsed expression with a kendoEvent local that the expression can use.
          changeExpFn(scope, locals);
        });
      };
    };
  }

  return {
    restrict: 'ACE',
    link: function(scope, element, attrs) {
      kendoDecorator.addOptionsDecorator(element, createCompileRowsDecorator(scope, 'dataItem'));

      // if k-on-change was defined, expose the selected rows/cells and not just the kendo event
      if( attrs.kOnChange ) {
        kendoDecorator.addOptionsDecorator(element, createChangeDecorator(scope, $parse(attrs.kOnChange)));
      }

    }
  };

}]);
