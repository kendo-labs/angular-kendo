describe('services widget', function () {
    'use strict';

    beforeEach(module('kendo.directives'));

    it('should have collected Kendo widget names', function () {
        inject(function (widgets) {
            //check for a few widgets
            expect(widgets).toContain('kendoGrid');
            expect(widgets).toContain('kendoPager');
            expect(widgets).toContain('kendoPopup');
            expect(widgets).toContain('kendoAutoComplete');
            expect(widgets).toContain('kendoWindow');
            expect(widgets).toContain('kendoSelect');
        });
    });
});
