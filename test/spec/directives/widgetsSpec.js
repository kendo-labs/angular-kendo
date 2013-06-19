describe('Widgets Directive', function () {
    'use strict';

    /* The following web edition widgets will be tested in this test-case.
     * The testing will be mostly with default options and emphasis is on availability of
     * angular wrapper kendo-* directives for these rather than functionality of each widget.
     *
     * kendoAutoComplete, kendoCalendar, kendoColorPalette, kendoColorPicker, kendoComboBox
     * kendoDatePicker, kendoDateTimePicker, kendoDropDownList, kendoEditor, kendoFlatColorPicker
     * kendoGrid, kendoListView, kendoMenu, kendoMultiSelect, kendoNumericTextBox
     * kendoPager, kendoPanelBar, kendoRangeSlider, kendoSlider, kendoSplitter
     * kendoTabStrip, kendoTimePicker, kendoTooltip, kendoTreeView, kendoUpload
     * kendoWindow
     */

    beforeEach(module('kendo.directives'));

    // kendoAutoComplete
    it('should create kendoAutoComplete widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.opts = ['one', 'two'];
            var element = $compile('<div><input id="autoComplete" kendo-auto-complete="opts"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#autoComplete').data('role');
            expect(dataRole).toBe('autocomplete');
        });
    });

    // kendoCalendar
    it('should create kendoCalendar widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="calendar" kendo-calendar></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#calendar').data('role');
            expect(dataRole).toBe('calendar');
        });
    });

    // kendoColorPalette
    it('should create kendoColorPalette widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="colorPalette" kendo-color-palette></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#colorPalette').data('role');
            expect(dataRole).toBe('colorpalette');
        });
    });

    // kendoColorPicker
    it('should create kendoColorPicker widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="colorPicker" kendo-color-picker></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#colorPicker').data('role');
            expect(dataRole).toBe('colorpicker');
        });
    });

    // kendoComboBox
    it('should create kendoComboBox widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.items = [{ text: "Item 1", value: "1" }, { text: "Item 2", value: "2" }];
            var element = $compile('<div><input id="comboBox" kendo-combo-box="items"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#comboBox').data('role');
            expect(dataRole).toBe('combobox');
        });
    });

    // kendoDatePicker
    it('should create kendoDatePicker widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="datePicker" kendo-date-picker></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#datePicker').data('role');
            expect(dataRole).toBe('datepicker');
        });
    });

    // kendoDateTimePicker
    it('should create kendoDateTimePicker widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="dateTimePicker" kendo-date-time-picker></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#dateTimePicker').data('role');
            expect(dataRole).toBe('datetimepicker');
        });
    });

    // kendoDropDownList
    it('should create kendoDropDownList widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.data = [
                { text: "Black", value: "1" },
                { text: "Orange", value: "2" },
                { text: "Grey", value: "3" }
            ];

            $rootScope.opts = {
                dataTextField: "text",
                dataValueField: "value"
            };

            var element = $compile('<div><input id="dropDownList" kendo-drop-down-list="opts" kendo-source="data"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#dropDownList').data('role');
            expect(dataRole).toBe('dropdownlist');
        });
    });

    // kendoEditor
    //TODO failing test. Need to investigate
    /*it('should create kendoEditor widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><textarea id="editor" kendo-editor rows="10" cols="30"></textarea></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#editor').data('role');
            expect(dataRole).toBe('editor');
        });
    });*/

    // kendoFlatColorPicker
    it('should create kendoFlatColorPicker widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="flatColorPicker" kendo-flat-color-picker></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#flatColorPicker').data('role');
            expect(dataRole).toBe('flatcolorpicker');
        });
    });

    // kendoGrid
    it('should create kendoGrid widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.data = [
                { name: "Jane Doe", age: 30 },
                { name: "John Doe", age: 33 }
            ]
            var element = $compile('<div><div id="grid" kendo-grid kendo-source="data"></div></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#grid').data('role');
            expect(dataRole).toBe('grid');
        });
    });
    // kendoListView
    // kendoMenu

    // kendoMultiSelect
    it('should create kendoMultiSelect widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.data = [
                { text: "Black", value: "1" },
                { text: "Orange", value: "2" },
                { text: "Grey", value: "3" }
            ];

            $rootScope.opts = {
                dataTextField: "text",
                dataValueField: "value"
            };

            var element = $compile('<div><input id="multiSelect" kendo-multi-select="opts" kendo-source="data"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#multiSelect').data('role');
            expect(dataRole).toBe('multiselect');
        });
    });

    // kendoNumericTextBox
    it('should create kendoNumericTextBox widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="numericTextBox" kendo-numeric-text-box min="0" max="100" step="1"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#numericTextBox').data('role');
            expect(dataRole).toBe('numerictextbox');
        });
    });

    // kendoPager
    // kendoPanelBar
    // kendoRangeSlider

    // kendoSlider
    it('should create kendoSlider widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            $rootScope.opts = {
                increaseButtonTitle: "Right",
                decreaseButtonTitle: "Left",
                min: -10,
                max: 10,
                smallStep: 2,
                largeStep: 1
            };

            var element = $compile('<div><input id="slider" kendo-slider="opts"></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#slider').data('role');
            expect(dataRole).toBe('slider');
        });
    });

    // kendoSplitter
    // kendoTabStrip

    // kendoTimePicker
    it('should create kendoTimePicker widget', function () {
        inject(function ($rootScope, $compile, $timeout) {
            var element = $compile('<div><input id="timePicker" kendo-time-picker></div>')($rootScope);
            $rootScope.$apply();
            $timeout.flush();
            var dataRole = element.find('#timePicker').data('role');
            expect(dataRole).toBe('timepicker');
        });
    });

    // kendoTooltip
    // kendoTreeView
    // kendoUpload
    // kendoWindow
});