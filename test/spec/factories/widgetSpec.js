describe('Widget Factory', function () {
    'use strict';

    /* It could have been any, but kendoDatePicker and kendoDropDownList widgets have been used for tests
     * The aim is not testing these widgets but testing the widget factory.
     */
    beforeEach(module('kendo.directives'));

    it('should create kendo widget with default options', function () {
        inject(function ($rootScope, widgetFactory) {
            $rootScope.opts = {
                format: 'dd/MM/yyyy',
                value: new Date(2012, 11, 15)// 15 December 2012
            };
            var element = angular.element('<input>');
            var datePickerWidget = widgetFactory.create($rootScope, element, {kOptions: 'opts'}, 'kendoDatePicker');
            var datePickerVal = datePickerWidget.value();
            var datePickerValStr = datePickerVal.getDate() + '/' + (datePickerVal.getMonth() + 1) + '/' + datePickerVal.getFullYear();

            //Compare date picker value and input value are equal
            expect(datePickerValStr).toEqual(element.val());
        });
    });

    it('should override default option with one set on element', function () {
        inject(function ($rootScope, widgetFactory) {
            //default format is dd/MM/yyyy
            $rootScope.opts = {
                format: 'dd/MM/yyyy',
                value: new Date(2012, 11, 15)// 15 December 2012
            };
            var element = angular.element('<input>');
            //Override format with MM/dd/yyyy
            element.data('format', 'formatOverride');
            //Note the format in attrs is a string and not an expression
            var datePickerWidget = widgetFactory.create($rootScope, element, {kOptions: 'opts', kFormat: 'MM/dd/yyyy'}, 'kendoDatePicker');
            var datePickerVal = datePickerWidget.value();
            var datePickerValStr = (datePickerVal.getMonth() + 1) + '/' + datePickerVal.getDate() + '/' + datePickerVal.getFullYear();
            //Compare date picker value and input value are equal
            expect(datePickerValStr).toEqual(element.val());
        });
    });

    it('should setup event handlers', function () {
        inject(function ($rootScope, $timeout, widgetFactory) {
            $rootScope.onOpenFn = jasmine.createSpy('onOpenFn');
            $rootScope.opts = {
                format: 'dd/MM/yyyy',
                value: new Date(2012, 11, 15)// 15 December 2012
            };
            var element = angular.element('<input>');
            var datePickerWidget = widgetFactory.create($rootScope, element, {kOptions: 'opts', kOnOpen: 'onOpenFn'}, 'kendoDatePicker');
            datePickerWidget.open();
            //Let the digest cycle complete and then verify the open callback is executed
            $timeout(function () {
                expect($rootScope.onOpenFn).toHaveBeenCalled();
            }, 0);
        });
    });

    it('should inherit datasource from ancestor', function () {
        inject(function ($rootScope, widgetFactory) {
            var data = [
                { text: "Black", value: "1" },
                { text: "Orange", value: "2" },
                { text: "Grey", value: "3" }
            ];
            var element = angular.element('<div><select></select></div>');
            element.data('$kendoDataSource', data);

            $rootScope.opts = {
                dataTextField: "text",
                dataValueField: "value"
            };
            var dropdownListWidget = widgetFactory.create($rootScope, element.children().first(), {kOptions: 'opts'}, 'kendoDropDownList');
            expect(dropdownListWidget.value()).toEqual('1');
        });
    });
});