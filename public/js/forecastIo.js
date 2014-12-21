/**
 * https://developer.forecast.io/docs/v2
 */
define(['angular'], function (angular) {

  var forecastIoModule = angular.module('forecastIo', []);

  forecastIoModule.provider('forecastIo', [function () {

    var config = this.config = {
      google: {
        serverApiKey: null
      }
    };

    this.$get = [
      '$http', '$q',
      function ($http, $q) {

        var forecastIo = {};

        /**
         * https://developer.forecast.io/docs/v2#data-points
         */
        forecastIo.conditions = {
          clearDay: 'clear-day',
          clearNight: 'clear-night',
          rain: 'rain',
          snow: 'snow',
          sleet: 'sleet',
          wind: 'wind',
          fog: 'fog',
          cloudy: 'cloudy',
          partlyCloudyDay: 'partly-cloudy-day',
          partlyCloudNight: 'partly-cloudy-night'
        };

        forecastIo.get = function (location) {

          var deferred = $q.defer();
          var promise = deferred.promise;

          var cache = true;

          var lat;
          var lng;
          if (location) {
            if (location.coords) {
              lat = location.coords.lat;
              if (! angular.isNumber(lat)) {
                lat = location.coords.latitude;
              }
              lng = location.coords.lng;
              if (! angular.isNumber(lng)) {
                lng = location.coords.longitude;
              }
            }
          }

          if ( ! ( angular.isNumber(lat) && angular.isNumber(lng) ) ) {
            deferred.reject('lat and lng must be numeric');
            return promise;
          }

          // defaults
          // lat = lat || 37.8267;
          // lng = lng || -122.423;

          var url;
          // url = '/data/forecast-io_37.8267_-122.423.json';
          url = 'https://api.forecast.io/forecast/' + config.apiKey + '/' + lat + ',' + lng;

          $http.
            jsonp(url, {
              cache: cache,
              params: {
                callback: 'JSON_CALLBACK'
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

          return promise;
        };

        return forecastIo;
      }];

  }]);

  return forecastIoModule;
});
