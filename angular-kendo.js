(function(f, define){
  define([ "jquery", "angular", "kendo" ], f);
})(function($, angular, kendo) {

  "use strict";

  var _UID_ = kendo.attr("uid");

  var module = angular.module('kendo.directives', []);
  var parse, timeout, compile = function compile(){ return compile }, log;

  function immediately(f) {
    var save_timeout = timeout;
    timeout = function(f) { return f() };
    try {
      return f();
    } finally {
      timeout = save_timeout;
    }
  }

  var OPTIONS_NOW;

  var factories = {
    dataSource: (function() {
      var types = {
        TreeView: 'HierarchicalDataSource',
        Scheduler: 'SchedulerDataSource'
      };
      var toDataSource = function(dataSource, type) {
        return kendo.data[type].create(dataSource);
      };
      return function(scope, element, attrs, role) {
        var type = types[role] || 'DataSource';
        var ds = toDataSource(scope.$eval(attrs.kDataSource), type);

        // Set $kendoDataSource in the element's data. 3rd parties can define their own dataSource creation
        // directive and provide this data on the element.
        element.data('$kendoDataSource', ds);

        // not recursive -- this triggers when the whole data source changed
        scope.$watch(attrs.kDataSource, function(mew, old){
          if (mew !== old) {
            var ds = toDataSource(mew, type);
            element.data('$kendoDataSource', ds);
            var widget = kendoWidgetInstance(element);
            if (widget && typeof widget.setDataSource == "function") {
              widget.setDataSource(ds);
            }
          }
        });
        return ds;
      };
    }()),

    widget: (function() {
      var ignoredAttributes = {
        kDataSource : true,
        kOptions    : true,
        kRebind     : true,
        kNgModel    : true,
      };
      return function(scope, element, attrs, widget) {
        var role = widget.replace(/^kendo/, '');
        var options = angular.extend({}, scope.$eval(attrs.kOptions));
        $.each(attrs, function(name, value) {
          if (!ignoredAttributes[name]) {
            var match = name.match(/^k(On)?([A-Z].*)/);
            if (match) {
              var optionName = match[2].charAt(0).toLowerCase() + match[2].slice(1);
              if (match[1]) {
                options[optionName] = value;
              } else {
                options[optionName] = angular.copy(scope.$eval(value));
                if (options[optionName] === undefined && value.match(/^\w*$/)) {
                  log.warn(widget + '\'s ' + name + ' attribute resolved to undefined. Maybe you meant to use a string literal like: \'' + value + '\'?');
                }
              }
            }
          }
        });
        options.dataSource = element.inheritedData('$kendoDataSource') || options.dataSource;

        // parse the datasource attribute
        if (attrs.kDataSource) {
          options.dataSource = factories.dataSource(scope, element, attrs, role);
        }

        options.$angular = true;
        var object = $(element)[widget](OPTIONS_NOW = options).data(widget);
        exposeWidget(object, scope, attrs, widget);
        scope.$emit("kendoWidgetCreated", object);
        return object;
      };
    }())
  };

  function exposeWidget(widget, scope, attrs, kendoWidget) {
    if (attrs[kendoWidget]) {
      // expose the widget object
      var set = parse(attrs[kendoWidget]).assign;
      if (set) {
        // set the value of the expression to the kendo widget object to expose its api
        set(scope, widget);
      } else {
        throw new Error( kendoWidget + ' attribute used but expression in it is not assignable: ' + attrs[kendoWidget]);
      }
    }
  }

  module.factory('directiveFactory', ['$timeout', '$parse', '$compile', '$log', function($timeout, $parse, $compile, $log) {

    timeout = $timeout;
    parse = $parse;
    compile = $compile;
    log = $log;

    var KENDO_COUNT = 0;

    var create = function(role) {

      return {
        // Parse the directive for attributes and classes
        restrict: "ACE",
        require: [ "?ngModel", "^?form" ],
        scope: false,

        // // XXX: Is this transclusion needed?  We seem to do better without it.
        // //      https://github.com/kendo-labs/angular-kendo/issues/90
        //
        // transclude: true,
        // controller: [ '$scope', '$attrs', '$element', '$transclude', function($scope, $attrs, $element, $transclude) {
        //   // Make the element's contents available to the kendo widget to allow creating some widgets from existing elements.
        //   $transclude(function(clone){
        //     $element.append(clone);
        //   });
        // }],

        link: function(scope, element, attrs, controllers) {

          var ngModel = controllers[0];
          var ngForm = controllers[1];

          // we must remove data-kendo-widget-name attribute because
          // it breaks kendo.widgetInstance; can generate all kinds
          // of funny issues like
          // https://github.com/kendo-labs/angular-kendo/issues/167

          // $(element).removeData(role);
          // console.log($(element).data(role)); // --> not undefined.  now I'm pissed.
          $(element)[0].removeAttribute("data-" + role.replace(/([A-Z])/g, "-$1"));

          ++KENDO_COUNT;

          timeout(function() {
            // if k-rebind attribute is provided, rebind the kendo widget when
            // the watched value changes
            if (attrs.kRebind) {
              var originalElement = $(element)[0].cloneNode(true);
              // watch for changes on the expression passed in the k-rebind attribute
              scope.$watch(attrs.kRebind, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                  // create the kendo widget and bind it to the element.
                  try {
                    /****************************************************************
                     // XXX: this is a gross hack that might not even work with all
                     // widgets.  we need to destroy the current widget and get its
                     // wrapper element out of the DOM, then make the original element
                     // visible so we can initialize a new widget on it.
                     //
                     // kRebind is probably impossible to get right at the moment.
                     ****************************************************************/
                    var _wrapper = $(widget.wrapper)[0];
                    var _element = $(widget.element)[0];
                    widget.destroy();
                    if (_wrapper && _element) {
                      _wrapper.parentNode.replaceChild(_element, _wrapper);
                      var clone = originalElement.cloneNode(true);
                      $(element).replaceWith(clone);
                      element = $(clone);
                    }
                    widget = factories.widget(scope, element, attrs, role);
                    setupBindings();
                  } catch(ex) {
                    console.error(ex);
                    console.error(ex.stack);
                  }
                }
              }, true); // watch for object equality. Use native or simple values.
            }

            var widget = factories.widget(scope, element, attrs, role);
            setupBindings();

            var prev_destroy = null;
            function setupBindings() {

              var isFormField = /^(input|select|textarea)$/i.test(element[0].tagName);
              function value() {
                return isFormField ? element.val() : widget.value();
              }

              // Cleanup after ourselves
              if (prev_destroy) {
                prev_destroy();
              }
              prev_destroy = scope.$on("$destroy", function() {
                widget.destroy();
              });

              // 2 way binding: ngModel <-> widget.value()
              if (ngModel) {
                if (!widget.value) {
                  throw new Error('ng-model used but ' + role + ' does not define a value accessor');
                }

                // Angular will invoke $render when the view needs to be updated with the view value.
                ngModel.$render = function() {
                  // Update the widget with the view value.
                  widget.value(ngModel.$viewValue);
                };

                // Some widgets trigger "change" on the input field
                // and this would result in two events sent (#135)
                var haveChangeOnElement;
                element.on("change", function(){
                  haveChangeOnElement = true;
                });

                var onChange = function(pristine){
                  return function(){
                    haveChangeOnElement = false;
                    timeout(function(){
                      if (haveChangeOnElement) return;
                      if (pristine && ngForm) {
                        var formPristine = ngForm.$pristine;
                      }
                      ngModel.$setViewValue(value());
                      if (pristine) {
                        ngModel.$setPristine();
                        if (formPristine) {
                          ngForm.$setPristine();
                        }
                      }
                    });
                  };
                };

                bindBefore(widget, "change", onChange(false));
                bindBefore(widget, "dataBound", onChange(true));

                var currentVal = value();

                // if the model value is undefined, then we set the widget value to match ( == null/undefined )
                if (currentVal != ngModel.$viewValue) {
                  if (!ngModel.$isEmpty(ngModel.$viewValue)) {
                    widget.value(ngModel.$viewValue);
                  } else if (currentVal != null && currentVal != "" && currentVal != ngModel.$viewValue) {
                    ngModel.$setViewValue(currentVal);
                  }
                }

                ngModel.$setPristine();
              }

              // kNgModel is used for the "logical" value
              OUT: if (attrs.kNgModel) {
                if (typeof widget.value != "function") {
                  log.warn("k-ng-model specified on a widget that does not have the value() method: " + (widget.options.name));
                  break OUT;
                }
                var getter = parse(attrs.kNgModel);
                var setter = getter.assign;
                var isEmpty = widget.value() == null || widget.value() == "";

                // initial value
                if (getter(scope) !== widget.value() && !isEmpty) {
                  setter(scope, widget.value());
                } else if (isEmpty) {
                  widget.value(getter(scope));
                  widget.trigger("change");
                }

                // keep in sync
                scope.$watch(attrs.kNgModel, function(newValue, oldValue){
                  if (newValue === oldValue) return;
                  widget.value(newValue);
                });
                widget.bind("change", function(){
                  setter(scope, widget.value());
                });
              }
            }

            // mutation observers — propagate the original
            // element's class to the widget wrapper.
            (function(){

              if (!(window.MutationObserver && widget.wrapper)) {
                return;
              }

              var prevClassList = [].slice.call($(element)[0].classList);

              var mo = new MutationObserver(function(changes, mo){
                suspend();    // make sure we don't trigger a loop

                changes.forEach(function(chg){
                  var w = $(widget.wrapper)[0];
                  switch (chg.attributeName) {

                   case "class":
                    // sync classes to the wrapper element
                    var currClassList = [].slice.call(chg.target.classList);
                    currClassList.forEach(function(cls){
                      if (prevClassList.indexOf(cls) < 0) {
                        w.classList.add(cls);
                      }
                    });
                    prevClassList.forEach(function(cls){
                      if (currClassList.indexOf(cls) < 0) {
                        w.classList.remove(cls);
                      }
                    });
                    prevClassList = currClassList;
                    break;

                   case "disabled":
                    if (typeof widget.enable == "function") {
                      widget.enable(!$(chg.target).attr("disabled"));
                    }
                    break;

                   case "readonly":
                    if (typeof widget.readonly == "function") {
                      widget.readonly(!!$(chg.target).attr("readonly"));
                    }
                    break;
                  }
                });

                resume();
              });

              function suspend() {
                mo.disconnect();
              }
              function resume() {
                mo.observe($(element)[0], { attributes: true });
              }
              resume();
              bindBefore(widget, "destroy", suspend);
            })();

            --KENDO_COUNT;
            if (KENDO_COUNT == 0) {
              scope.$emit("kendoRendered");
            }

          });
        }
      };
    };

    return {
      create: create
    };
  }]);

  // create directives for every widget.
  angular.forEach([ kendo.ui, kendo.dataviz && kendo.dataviz.ui ], function(namespace) {
    angular.forEach(namespace, function(value, key) {
      if (key.match(/^[A-Z]/) && key !== 'Widget') {
        var widget = "kendo" + key;
        module.directive(widget, [
          "directiveFactory",
          function(directiveFactory) {
            return directiveFactory.create(widget);
          }
        ]);
      }
    });
  });

  /* -----[ utils ]----- */

  function kendoWidgetInstance(el) {
    el = $(el);
    return kendo.widgetInstance(el, kendo.ui) ||
      kendo.widgetInstance(el, kendo.mobile.ui) ||
      kendo.widgetInstance(el, kendo.dataviz.ui);
  }

  // XXX: using internal API (Widget::_events).  Seems to be no way in Kendo to
  // insert a handler to be executed before any existing ones, hence this hack.
  // Use for a single event/handler combination.
  function bindBefore(widget, name, handler, one) {
    widget.bind.call(widget, name, handler, one);
    var a = widget._events[name];
    a.unshift(a.pop());
  }

  function digest(scope) {
    if (!/^\$(digest|apply)$/.test(scope.$root.$$phase)) {
      scope.$digest();
    }
  }

  function destroyScope(scope, el) {
    scope.$destroy();
    if (el) {
      // prevent leaks. https://github.com/kendo-labs/angular-kendo/issues/237
      $(el)
        .removeData("$scope")
        .removeData("$isolateScope")
        .removeData("$isolateScopeNoTemplate");
    }
  }

  // defadvice will patch a class' method with another function.  That
  // function will be called in a context containing `next` (to call
  // the next method) and `object` (a reference to the original
  // object).
  function defadvice(klass, methodName, func) {
    if ($.isArray(klass)) {
      return angular.forEach(klass, function(klass){
        defadvice(klass, methodName, func);
      });
    }
    if (typeof klass == "string") {
      var a = klass.split(".");
      var x = kendo;
      while (x && a.length > 0) x = x[a.shift()];
      // if (!x) {
      //   console.log("Can't advice " + klass + "::" + methodName);
      // }
      klass = x;
    }
    var origMethod = klass.prototype[methodName];
    klass.prototype[methodName] = function() {
      var self = this, args = arguments;
      return func.apply({
        self: self,
        next: function() {
          return origMethod.apply(self, arguments.length > 0 ? arguments : args);
        }
      }, args);
    };
  }

  var BEFORE = "$angular_beforeCreate";
  var AFTER = "$angular_afterCreate";

  /* -----[ Customize widgets for Angular ]----- */

  // XXX: notice we can't override `init` in general for any widget,
  // because kendo.ui.Widget === kendo.ui.Widget.prototype.init.
  // Hence we resort to the beforeCreate/afterCreate hack.
  defadvice("ui.Widget", "init", function(element, options){
    if (!options && OPTIONS_NOW) options = OPTIONS_NOW;
    OPTIONS_NOW = null;
    var self = this.self;
    if (options && options.$angular) {
      // call before/after hooks only for widgets instantiated by angular-kendo
      self.$angular_beforeCreate(element, options);
      this.next();
      self.$angular_afterCreate();
    } else {
      this.next();
    }
  });

  // All event handlers that are strings are compiled the Angular way.
  defadvice("ui.Widget", BEFORE, function(element, options) {
    var self = this.self;
    if (options && !$.isArray(options)) {
      var scope = angular.element(element).scope();
      for (var i = self.events.length; --i >= 0;) {
        var event = self.events[i];
        var handler = options[event];
        if (handler && typeof handler == "string")
          options[event] = self.$angular_makeEventHandler(event, scope, handler);
      }
    }
  });

  defadvice("ui.Widget", AFTER, function(){});

  // most handers will only contain a kendoEvent in the scope.
  defadvice("ui.Widget", "$angular_makeEventHandler", function(event, scope, handler){
    handler = parse(handler);
    return function(e) {
      if (/^\$(apply|digest)$/.test(scope.$root.$$phase)) {
        handler(scope, { kendoEvent: e });
      } else {
        scope.$apply(function() { handler(scope, { kendoEvent: e }) });
      }
    };
  });

  // for the Grid and ListView we add `data` and `selected` too.
  defadvice([ "ui.Grid", "ui.ListView" ], "$angular_makeEventHandler", function(event, scope, handler){
    if (event != "change") return this.next();
    handler = parse(handler);
    return function(ev) {
      var widget = ev.sender;
      var options = widget.options;
      var dataSource = widget.dataSource;
      var cell, multiple, locals = { kendoEvent: ev }, elems, items, columns, colIdx;

      if (angular.isString(options.selectable)) {
        cell = options.selectable.indexOf('cell') !== -1;
        multiple = options.selectable.indexOf('multiple') !== -1;
      }

      elems = locals.selected = this.select();
      items = locals.data = [];
      columns = locals.columns = [];
      for (var i = 0; i < elems.length; i++) {
        var item = cell ? elems[i].parentNode : elems[i];
        var itemUid = $(item).attr(_UID_);
        var dataItem = dataSource.getByUid(itemUid);
        if (cell) {
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

      if (!multiple) {
        locals.data = items[0];
        locals.selected = elems[0];
      }

      scope.$apply(function() { handler(scope, locals) });
    };
  });

  // for PanelBar, TabStrip and Splitter, hook on `contentLoad` to
  // compile Angular templates.
  defadvice([ "ui.PanelBar", "ui.TabStrip", "ui.Splitter" ], AFTER, function() {
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (scope) bindBefore(self, "contentLoad", function(ev){
      //                   tabstrip/panelbar    splitter
      var contentElement = ev.contentElement || ev.pane;
      compile(ev.contentElement)(scope);
      digest(scope);
    });
  });

  // on Draggable::_start compile the content as Angular template, if
  // an $angular_scope method is provided.
  defadvice("ui.Draggable", "_start", function(){
    this.next();
    var self = this.self;
    if (self.hint) {
      var scope = angular.element(self.currentTarget).scope();
      if (scope) {
        compile(self.hint)(scope);
        digest(scope);
      }
    }
  });

  // If no `template` is supplied for Grid columns, provide an Angular
  // template.  The reason is that in this way AngularJS will take
  // care to update the view as the data in scope changes.
  defadvice("ui.Grid", BEFORE, function(element, options){
    this.next();
    if (options.columns) angular.forEach(options.columns, function(col){
      if (col.field && !col.template && !col.format) {
        col.template = "<span ng-bind='dataItem." + col.field + "'>#: " + col.field + "#</span>";
      }
    });
  });

  // for Grid, ListView and TreeView, provide a dataBound handler that
  // recompiles Angular templates.  We need to do this before the
  // widget is initialized so that we catch the first dataBound event.
  defadvice([ "ui.Grid", "ui.ListView", "ui.TreeView" ], BEFORE, function(element, options){
    this.next();
    var scope = angular.element(element).scope();
    if (!scope) return;
    var self = this.self;
    var role = self.options.name;
    var prev_dataBound = options.dataBound;
    options.dataBound = function(ev) {
      var widget = ev.sender;
      var dataSource = widget.dataSource;
      var dirty = false;
      widget.items().each(function(){
        // XXX HACK: the tree view will call dataBound multiple
        // times, sometimes for LI-s containing nested items that
        // may have been already compiled.  Therefore in this
        // situation we compile the ".k-in" element, which contains
        // only the template for a single item.
        var elementToCompile = role == "TreeView"
          ? $(this).find(".k-in").first()
          : $(this);
        if (!elementToCompile.hasClass("ng-scope")) {
          var itemUid = $(this).attr(_UID_);
          var item = dataSource.getByUid(itemUid);
          var itemScope = scope.$new();
          itemScope.dataItem = item;
          compile(elementToCompile)(itemScope);
          dirty = true;
        }
      });
      try {
        if (prev_dataBound) return prev_dataBound.apply(this, arguments);
      } finally {
        if (dirty) digest(scope);
      }
    };
  });

  // templates for autocomplete and combo box
  defadvice([ "ui.AutoComplete", "ui.ComboBox" ], BEFORE, function(element, options){
    this.next();
    var scope = angular.element(element).scope();
    if (!scope) return;
    var self = this.self;
    var prev_dataBound = options.dataBound;
    options.dataBound = function(ev) {
      var widget = ev.sender;
      var dataSource = widget.dataSource;
      var dirty = false;
      $(widget.items()).each(function(){
        var el = $(this);
        if (!el.hasClass("ng-scope")) {
          var item = widget.dataItem(el.index());
          var itemScope = scope.$new();
          itemScope.dataItem = item;
          compile(el)(itemScope);
          dirty = true;
        }
      });
      try {
        if (prev_dataBound) return prev_dataBound.apply(this, arguments);
      } finally {
        if (dirty) digest(scope);
      }
    };
  });

  defadvice([ "ui.AutoComplete", "ui.ComboBox" ], AFTER, function(){
    this.next();
    this.self.bind("dataBinding", function(ev){
      $(ev.sender.items()).each(function(){
        var scope = angular.element(this).scope();
        if (scope) {
          destroyScope(scope, this);
        }
      });
    });
  });

  defadvice([ "ui.Grid", "ui.ListView" ], AFTER, function(){
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (!scope) return;

    // itemChange triggers when a single item is changed through our
    // DataSource mechanism.
    self.bind("itemChange", function(ev) {
      var dataSource = ev.sender.dataSource;
      var itemElement = ev.item[0];
      var itemScope = scope.$new();
      itemScope.dataItem = dataSource.getByUid(ev.item.attr(_UID_));
      compile(itemElement)(itemScope);
      digest(itemScope);
    });

    // dataBinding triggers when new data is loaded.  We use this to
    // destroy() each item's scope.
    self.bind("dataBinding", function(ev) {
      ev.sender.items().each(function(){
        var el = $(this);
        if (el.attr(_UID_)) {
          var rowScope = angular.element(this).scope();
          // avoid destroying the widget's own scope
          // no idea why we get it, but we do.... :(
          if (rowScope && rowScope !== scope) {
            destroyScope(rowScope, el);
          }
        }
      });
    });
  });

  defadvice("ui.Grid", "_toolbar", function(){
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (scope) {
      compile(self.wrapper.find(".k-grid-toolbar").first())(scope);
      digest(scope);
    }
  });

  defadvice("ui.Grid", "_thead", function(){
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (scope) {
      compile(self.thead)(scope);
      digest(scope);
    }
  });

  defadvice("ui.editor.Toolbar", "render", function(){
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (scope) {
      compile(self.element)(scope);
      digest(scope);
    }
  });

  defadvice("ui.Grid", AFTER, function(){
    this.next();
    var self = this.self;
    var scope = angular.element(self.element).scope();
    if (scope) {
      if (self.options.detailTemplate) bindBefore(self, "detailInit", function(ev){
        var detailScope = scope.$new();
        detailScope.dataItem = ev.data;
        compile(ev.detailCell)(detailScope);
        digest(detailScope);
      });
    }
  });

  defadvice("ui.Grid", "cancelRow", function(){
    var self = this.self;
    var scope = angular.element(self.element).scope();
    var cont = self._editContainer;
    if (cont) {
      var model = self._modelForContainer(cont);
      var uid = model.uid;
      var prevScope = angular.element(cont).scope();
      if (prevScope !== scope) {
        destroyScope(prevScope, cont);
      }
    }
    this.next();
    if (uid) {
      var row = self.items().filter("[" + _UID_ + "=" + uid + "]");
      var rowScope = scope.$new();
      rowScope.dataItem = model;
      compile(row)(rowScope);
      digest(scope);
    }
  });

  defadvice("ui.Editable", "refresh", function(){
    this.next();
    var self = this.self;
    var model = self.options.model;
    var scope = angular.element(self.element).scope();
    if (!scope || !model) return;

    if (self.$angular_scope) {
      destroyScope(self.$angular_scope, self.element);
    }

    scope = self.$angular_scope = scope.$new();
    scope.dataItem = model;

    // XXX: we need to disable the timeout here, or else the widget is
    // created but immediately destroyed (focus lost).
    immediately(function(){
      compile(self.element)(scope);
      digest(scope);
    });

    // and we still need to focus it.
    self.element.find(":kendoFocusable").eq(0).focus();
  });

  defadvice("ui.Editable", "destroy", function(){
    var self = this.self;
    if (self.$angular_scope) {
      destroyScope(self.$angular_scope, self.element);
      self.$angular_scope = null;
    }
    this.next();
  });

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(jQuery, angular, kendo); });

// Local Variables:
// js-indent-level: 2
// js2-basic-offset: 2
// End:
