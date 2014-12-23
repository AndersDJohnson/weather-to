define(['angular', 'lodash', 'httpDelayer'], function (angular, _) {

  var geocoderModule = angular.module('geocoder', ['httpDelayer']);


  var config = {
    google: {
      serverApiKey: null,
      url: 'https://maps.googleapis.com/maps/api/geocode/json'
    },
    httpDelayer: {
      id: 'geocoder',
      delay: null
    }
  };


  geocoderModule.config([
    '$httpProvider', 'httpDelayer',
    function ($httpProvider, httpDelayer) {
      httpDelayer($httpProvider, config.httpDelayer);
    }
  ]);


  geocoderModule.provider('geocoder', [function () {

    this.config = config;

    var url = config.google.url;

    this.$get = [
      '$http', '$q', '$log',
      function ($http, $q, $log) {

        var geocoder = {};

        var cache = true;


        geocoder.get = function (address, options) {

          options = _.defaults({}, options, {
            cache: true
          });

          var deferred = $q.defer();

          var cache = options.cache;

          $log.log('geocoding address', address);

          var key = config.google.serverApiKey;

          $http.
            get(url, {
              id: 'geocoder',
              cache: cache,
              params: {
                key: key,
                address: address
              }
            }).
            success(function (data) {
              deferred.resolve(data);
            }).
            error(function (err) {
              deferred.reject(err);
            });

          return deferred.promise;
        };


        geocoder.reverse = function (position, options) {

          options = _.defaults({}, options, {
            cache: true,
            result_type: []
          });

          var deferred = $q.defer();

          $log.log('reverse geocoding position', position, options);

          var result_type = options.result_type;
          var cache = options.cache;

          if (! angular.isArray(result_type) && result_type.indexOf('|') === -1) {
            result_type = [result_type];
          }
          result_type  = result_type.join('|');

          var latlng = position.coords.lat  + ',' + position.coords.lng;

          var key = config.google.serverApiKey;

          $http.
            get(url, {
              id: 'geocoder',
              cache: cache,
              params: {
                key: key,
                latlng: latlng,
                result_type : result_type
              }
            }).
            success(function (data) {
              deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
              deferred.reject({
                data: data,
                status: status,
                headers: headers,
                config: config
              });
            });

          return deferred.promise;
        };


        return geocoder;
      }];

  }]);

  return geocoderModule;
});
