define(['angular', 'angular-mocks', 'categories'], function (angular) {

    describe('categories', function () {
        var categories;
        var $rootScope;

        beforeEach(module('categories'));

        beforeEach(inject(function(_categories_, _$rootScope_) {
            categories = _categories_;
            $rootScope = _$rootScope_;
        }));

        it('should exist', function() {
            expect(categories).toBeDefined();
        });

        it('should have 1', function(done) {
            categories.query()
                .then(function (cats) {
                    expect(cats[0].id).toEqual(1);
                    done();
                })
                .catch(done.fail);

            $rootScope.$digest();
        });
    });
});
