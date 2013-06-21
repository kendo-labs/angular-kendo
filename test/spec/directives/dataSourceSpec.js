describe('dataSource directive', function () {
    'use strict';

    beforeEach(module('kendo.directives'));

    it('should attach array datasource to element', function () {
        inject(function ($rootScope, $compile) {
            $rootScope.data = [
                {name: 'Frodo'},
                {name: 'Samwise'}
            ];

            var element = $compile('<div k-data-source="data"></div>')($rootScope);
            $rootScope.$apply();
            var ds = element.data('$kendoDataSource');

            expect(ds instanceof kendo.data.DataSource).toBe(true);
            ds.fetch(function () {
                expect(ds.at(0).name).toEqual('Frodo');
                expect(ds.at(1).name).toEqual('Samwise');
            });
        });
    });

    it('should attach datasource instance to element', function () {
        inject(function ($rootScope, $compile) {
            $rootScope.dataSource = new kendo.data.DataSource({
                data: [
                    {name: 'Frodo'},
                    {name: 'Samwise'}
                ]
            });

            var element = $compile('<div k-data-source="dataSource"></div>')($rootScope);
            $rootScope.$apply();
            var ds = element.data('$kendoDataSource');

            expect(ds instanceof kendo.data.DataSource).toBe(true);
            ds.fetch(function () {
                expect(ds.at(0).name).toEqual('Frodo');
                expect(ds.at(1).name).toEqual('Samwise');
            });
        });
    });

    it('should fire watcher when datasource value changes on scope ', function () {
        inject(function ($rootScope, $compile) {
            $rootScope.data = [
                {name: 'Frodo'},
                {name: 'Samwise'}
            ];

            var element = $compile('<div k-data-source="data"></div>')($rootScope);
            $rootScope.$apply();
            var ds = element.data('$kendoDataSource');

            ds.fetch(function () {
                expect(ds.at(0).name).toEqual('Frodo');
                expect(ds.at(1).name).toEqual('Samwise');
            });

            $rootScope.data = [
                {name: 'Merry'},
                {name: 'Pippin'}
            ];
            $rootScope.$apply();
            ds = element.data('$kendoDataSource');
            ds.fetch(function () {
                expect(ds.at(0).name).toEqual('Merry');
                expect(ds.at(1).name).toEqual('Pippin');
            })
        });
    });
});
