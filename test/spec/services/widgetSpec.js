describe('services widget', function () {
    'use strict';

    beforeEach(module('kendo.directives'));

    it('should have collected Kendo widget names', function () {
        inject(function (kendoWidgets) {
            var widgetsArr = [];

            angular.forEach([kendo.ui, kendo.dataviz && kendo.dataviz.ui], function(namespace) {
                angular.forEach(namespace, function(value, key) {
                    // add all widgets
                    if( key.match(/^[A-Z]/) && key !== 'Widget' ){
                        widgetsArr.push("kendo" + key);
                    }
                });
            });

            expect(widgetsArr).toEqual(kendoWidgets);
        });
    });
});
