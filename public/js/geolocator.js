define(['angular'], function (angular) {

  var geolocatorModule = angular.module('geolocator', []);

  var config = {
    delay: 0
  };

  geolocatorModule.provider('geolocator', [function () {

    this.config = config;

    this.$get = [
      '$q', '$log', '$timeout',
      function ($q, $log, $timeout) {

        var geolocator = {};

        geolocator.locate = function () {
          var deferred = $q.defer();

          var geolocation = navigator.geolocation;

          if (geolocation) {
            geolocation.getCurrentPosition(function (position) {
              if (config.delay) {
                $timeout(function () {
                  deferred.resolve(position);
                }, config.delay);
              }
              else {
                deferred.resolve(position);
              }
            });
          }
          else {
            if (config.delay) {
              $timeout(function () {
                deferred.reject('unsupported');
              }, config.delay);
            }
            else {
              deferred.reject('unsupported');
            }
          }

          return deferred.promise;
        };

        return geolocator;
      }
    ];

  }]);

  return geolocatorModule;
});
