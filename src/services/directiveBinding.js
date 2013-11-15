angular.module('kendo.directives').service('directiveBinding', [
  function() {
    // Supported Directives
    // angular
      // ngDisabled
      // ngShow
      // ngHide
      // ngReadonly
    // Kendo
      // kEnable
    // Non Directive
      // visible

    var methodDirectiveMap = {
      'enable': ['!ngDisabled', 'kEnable'],
      'readonly': ['ngReadonly']
    },
      standardDirectiveMap = {
        'visible': ['ngShow', '!ngHide']
      },
      standardMethods = {
        'visible': function(widget, kendoWidget) {
          var parentElement = widget.element.closest('.k-widget');

          return function visibleWidget(visible) {
            if (visible && !parentElement.is(':visible'))
              parentElement.show()
            else if (parentElement.is(':visible'))
              parentElement.hide();
          }
        }
      },
      angularCss = ['ng-valid', 'ng-invalid', 'ng-pristine', 'ng-dirty'],
      combinedCss = angularCss.join(' ');


    function applyWatch(method, $scope, attributeValue, negate) {
      if (attributeValue) {

        // Currently this is only one way binding, we obey value changes in angular
        // If our internal state changes we're not informing angular about that.
        // Namely looking at the kendo code, these are calls to the internal _editable method
        $scope.$watch(attributeValue, function(newValue, oldValue) {
          if (newValue !== oldValue) {
            // allow negation
            method(negate ? !newValue : newValue);
          }
        });
      }
    }

    function bindToDirectives($scope, attrs, widget, kendoWidget) {
      var widgetName = kendoWidget.substring('kendo'.length),
        widgetClass = kendo.ui[widgetName] || kendo.dataviz && kendo.dataviz.ui[widgetName];

      // We attempt to find the associated class with the kendo control
      // If we can identify if the widget supports any methods that we do
      //    we then see if the user has tied any directives that are supported
      //    to this widget.
      if (widgetClass && widgetClass.prototype) {
        var proto = widgetClass.prototype;
        if (proto) {
          angular.forEach(methodDirectiveMap, function(directives, method) {
            if (proto[method]) {
              for (var i = 0, len = directives.length; i < len; i++) {
                var attributeName = directives[i],
                  negate = attributeName.indexOf('!') > -1; // allow for short hand of directives that reverse

                if (negate)
                  attributeName = attributeName.substring(1);

                applyWatch(angular.bind(widget, widget[method]),
                  $scope,
                  attrs[attributeName],
                  negate);
              }
            }
          });
        }
      }

      angular.forEach(standardDirectiveMap, function(directives, method) {
        for (var i = 0, len = directives.length; i < len; i++) {
          var attributeName = directives[i],
            negate = attributeName.indexOf('!') > -1; // allow for short hand of directives that reverse

          if (negate)
            attributeName = attributeName.substring(1);

          applyWatch(standardMethods[method](widget, kendoWidget),
            $scope,
            attrs[attributeName],
            negate);
        }
      });

    }

    function migrateClasses(element, parentElement) {
      var classesToAdd = '',
        className = element[0].className;

      for (var i = 0, len = angularCss.length, v; i < len; i++) {
        var v = angularCss[i];
        if (className.indexOf(v) > -1)
          classesToAdd += (i && ' ' || '') + v;
      }

      parentElement
        .removeClass(combineCss) // remove old css classes
      .addClass(classesToAdd); // add new css classes
    }

    return {
      bind: bindToDirectives,
      migrateClasses: migrateClasses
    };

  }
]);