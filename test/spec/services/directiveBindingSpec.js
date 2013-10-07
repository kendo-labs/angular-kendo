describe('services directive binding', function() {
    'use strict';

    beforeEach(module('kendo.directives'));

    var camelCase = jQuery.camelCase;

    function testControl(what, controlDirectiveName, testDirectiveName, options, test, expected, state) {
        var camelCaseControlDirectiveName = camelCase(controlDirectiveName),
            camelCaseTestDirectiveName = camelCase(testDirectiveName),
            id = camelCaseControlDirectiveName.substring('kendo'.length).toLowerCase() + camelCaseControlDirectiveName.substring('kendo'.length + 1);

        // kendoAutoComplete
        it('should ' + what + ' ' + camelCaseControlDirectiveName + ' with ' + camelCaseTestDirectiveName, function() {
            inject(function($rootScope, $compile, $timeout) {
                $rootScope.opts = options;
                $rootScope.state = !!state;
                var element = $compile('<div><input id="' + id + '" ' + controlDirectiveName + (options && '="" ' || ' ') + testDirectiveName + '="state"></div>')($rootScope);
                element.appendTo(document.body); // So jQuery can detect visiblitiy
                $rootScope.$apply();
                $timeout.flush();

                var element = element.find('#' + id),
                    widget = element.data(camelCaseControlDirectiveName);

                $rootScope.state = !state;
                $rootScope.$apply();

                expect(test(element, widget)).toBe(expected);
                element.remove();
            });
        });
    }

    var inputControlsToTest = {
        'kendo-auto-complete': ['one', 'two'],
        'kendo-calendar': undefined,
        'kendo-color-palette': undefined,
        'kendo-color-picker': undefined,
        'kendo-combo-box': [{ text: "Item 1", value: "1" }, { text: "Item 2", value: "2" }],
        'kendo-date-picker': undefined,
        'kendo-date-time-picker': undefined,
        'kendo-drop-down-list':[
            { text: "Black", value: "1" },
            { text: "Orange", value: "2" },
            { text: "Grey", value: "3" }
        ],
        'kendo-flat-color-picker': undefined,
        'kendo-multi-select': [
            { text: "Black", value: "1" },
            { text: "Orange", value: "2" },
            { text: "Grey", value: "3" }
        ],
        'kendo-numeric-text-box': undefined,
        'kendo-slider': {
            increaseButtonTitle: "Right",
            decreaseButtonTitle: "Left",
            min: -10,
            max: 10,
            smallStep: 2,
            largeStep: 1
        },
        'kendo-time-picker': undefined
    };

    for (var i in inputControlsToTest) {
        var data = inputControlsToTest[i];
        testControl('disable', i, 'ng-disabled', data, function(element, widget){
            return !!element.attr('disabled');
        }, true);
    }

    for (var i in inputControlsToTest) {
        var data = inputControlsToTest[i];
        testControl('readonly', i, 'ng-readonly', data, function(element, widget){
            return !!element.attr('readonly');
        }, true);
    }

    for (var i in inputControlsToTest) {
        if (i !== 'kendo-flat-color-picker' && i !== 'kendo-color-palette' && i !== 'kendo-calendar')
        {
            var data = inputControlsToTest[i];
            testControl('enable', i, 'k-enable', data, function(element, widget){
                return !element.attr('disabled');
            }, false, true);
        }
    }

    for (var i in inputControlsToTest) {
        var data = inputControlsToTest[i];
        testControl('show', i, 'ng-show', data, function(element, widget){
            return !!element.closest('.k-widget').is(':visible');
        }, false, true);
    }

    for (var i in inputControlsToTest) {
        var data = inputControlsToTest[i];
        testControl('hide', i, 'ng-hide', data, function(element, widget){
            return !element.closest('.k-widget').is(':visible');
        }, true, false);
    }
});