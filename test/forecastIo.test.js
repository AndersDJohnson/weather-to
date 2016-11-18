define(['angular', 'angular-mocks', 'forecastIo'], function (angular) {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  describe('forecastIo', function () {
    var forecastIo;
    var $httpBackend;

    beforeEach(angular.mock.module('forecastIo', function (forecastIoProvider) {
      forecastIoProvider.config.apiKey = '82f9b0c2328032d8cb168d72ce202fbe';
    }));

    beforeEach(angular.mock.inject(function(_forecastIo_, _$httpBackend_) {
      forecastIo = _forecastIo_;
      $httpBackend = _$httpBackend_;
    }));

    it('should exist', function() {
      expect(forecastIo).toBeDefined();
    });

    it('should get', function(done) {
      $httpBackend.expect('JSONP', /.*api\.forecast\.io.*/).respond({
        test: true
      });

      forecastIo.get({
        lat: 90,
        lng: 90
      })
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
