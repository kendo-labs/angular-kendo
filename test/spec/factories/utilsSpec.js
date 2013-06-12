describe('Utils factory', function () {
    'use strict';

    beforeEach(module('kendo.directives'));

    var attrObj = {
        onClose: 'onClose',
        onResize: 'onResize',
        test1: 'val1',
        test2: 'val2'
    };

    var mockObj = {
        callbackFn: function (memo, value, key) {
            var eventName,
                match = key.match(/^on(.+)/);
            if (match) {
                eventName = match[1].charAt(0).toLowerCase() + match[1].slice(1);
                memo[eventName] = value;
            }
            return memo;
        }
    };
    beforeEach(function () {
       spyOn(mockObj, 'callbackFn').andCallThrough();
    });

    it('should invoke callback four times', function () {
        inject(function (utils) {
            utils.reduce(attrObj, mockObj.callbackFn, {});
            expect(mockObj.callbackFn).toHaveBeenCalled();
            expect(mockObj.callbackFn.calls.length).toEqual(4);
        });
    });

    it('should return memo with two properties', function () {
        inject(function (utils) {
            var retObj = utils.reduce(attrObj, mockObj.callbackFn, {});
            expect(Object.keys(retObj).length).toBe(2);
            expect(retObj.close).toBe('onClose');
            expect(retObj.resize).toBe('onResize');
        });
    });
});
