describe('Directive Factory', function () {
    'use strict';

    beforeEach(module('kendo.directives'));

    it('should return an object that can be registerd as directive', function () {
        inject(function (directiveFactory) {
            var directiveObj =  directiveFactory.create('kendoGrid');
            expect(directiveObj.restrict).toEqual('ACE');
            expect(directiveObj.transclude).toBe(true);
            expect(directiveObj.controller).toBeDefined();
            expect(directiveObj.link).toBeDefined();
        });
    });
});