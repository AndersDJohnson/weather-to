define(['angular', 'lodash'], function (angular, _) {

  var geolocatorModule = angular.module('geolocator', []);

  var config = {
    delay: 0,
    fail: false
  };

  geolocatorModule.provider('geolocator', [function () {

    this.config = config;

    this.$get = [
      '$q', '$log', '$timeout',
      function ($q, $log, $timeout) {

        var geolocator = {};

        var error = function (deferred, err) {
          $log.error('geolocator error', err);
          if (config.delay) {
            $timeout(function () {
              deferred.reject('unsupported');
            }, config.delay);
          }
          else {
            deferred.reject('unsupported');
          }
        };

        geolocator.locate = function (options) {

          options = _.defaults(options, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0
          });

          var deferred = $q.defer();
          var promise = deferred.promise;

          if (config.fail) {
            deferred.reject(config.fail);
            return promise;
          }

          var geolocation = navigator.geolocation;

          if (geolocation) {
            geolocation.getCurrentPosition(function (position) {
              $log.log('geolocator positioned', position);
              if (config.delay) {
                $timeout(function () {
                  deferred.resolve(position);
                }, config.delay);
              }
              else {
                deferred.resolve(position);
              }
            }, function (err) {
              error(deferred, err);
            });
          }
          else {
            error(deferred, 'unsupported');
          }

          return promise;
        };

        return geolocator;
      }
    ];

  }]);

  return geolocatorModule;
});
