/**
 * https://developer.forecast.io/docs/v2
 */
define(['angular', 'lodash'], function (angular, _) {

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
          clearDay: {
            index: 0,
            icon: 'clear-day',
            summary: 'Clear Day'
          },
          clearNight: {
            index: 1,
            icon: 'clear-night',
            summary: 'Clear Night'
          },
          rain: {
            index: 2,
            icon: 'rain',
            summary: 'Rain'
          },
          snow: {
            index: 3,
            icon: 'snow',
            summary: 'Snow'
          },
          sleet: {
            index: 4,
            icon: 'sleet',
            summary: 'Sleet'
          },
          wind: {
            index: 5,
            icon: 'wind',
            summary: 'Wind'
          },
          fog: {
            index: 6,
            icon: 'fog',
            summary: 'Fog'
          },
          cloudy: {
            index: 7,
            icon: 'cloudy',
            summary: 'Cloudy'
          },
          partlyCloudyDay: {
            index: 8,
            icon: 'partly-cloudy-day',
            summary: 'Partly Cloudy Day'
          },
          partlyCloudNight: {
            index: 9,
            icon: 'partly-cloudy-night',
            summary: 'Partly Cloudy Night'
          }
        };

        _.each(forecastIo.conditions, function (condition, key) {
          condition.key = key;
        });

        forecastIo.conditionsByIcon = _.transform(forecastIo.conditions, function (result, value, key) {
          result[value.icon] = value;
        });

        forecastIo.conditionsSorted = _(forecastIo.conditions).
          values().
          sortBy(function (condition) {
            return condition.index;
          })
          .value();


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
