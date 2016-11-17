define(['angular-mocks', 'geocoder'], function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    describe('geocoder', function () {
        var geocoder;
        var $httpBackend;

        beforeEach(module('geocoder', function (geocoderProvider) {
            geocoderProvider.config.google.serverApiKey = 'AIzaSyDmjRbBjb6x4YGyQm8CKG21Kocsix-D3kY';
        }));

        beforeEach(inject(function(_geocoder_, _$httpBackend_) {
            geocoder = _geocoder_;
            $httpBackend = _$httpBackend_;
        }));

        it('should exist', function() {
            expect(geocoder).toBeDefined();
        });

        it('should get', function(done) {
            $httpBackend.expect('GET', /.*maps\.googleapis\.com.*/).respond({
                test: true
            });

            geocoder.get('Minneapolis, MN')
                .then(function (data) {
                    expect(data).toBeDefined();
                    expect(data.test).toEqual(true);
                    done();
                })
                .catch(done.fail);

            $httpBackend.flush();
        });
    });
});
