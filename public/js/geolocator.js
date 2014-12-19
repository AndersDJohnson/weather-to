define(['angular'], function (angular) {

  var geolocatorModule = angular.module('geolocator', []);

  geolocatorModule.provider('geolocator', [function () {

    this.$get = [
      '$q', '$log',
      function ($q, $log) {

        var geolocator = {};

        geolocator.locate = function () {
          var deferred = $q.defer();

          var geolocation = navigator.geolocation;

          if (geolocation) {
            geolocation.getCurrentPosition(function (position) {
              deferred.resolve(position);
            });
          }
          else {
            return deferred.reject('unsupported');
          }

          return deferred.promise;
        };

        return geolocator;
    ];

  }]);

  return geolocatorModule;
});
