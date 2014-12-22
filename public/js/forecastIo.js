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
      '$log', '$http', '$q',
      function ($log, $http, $q) {

        var forecastIo = {};


        /**
         * https://erikflowers.github.io/weather-icons/
         */
        forecastIo.getIconClassForPoint = function (point, options) {
          options = angular.extend({
            prefix: '' // 'wi-'
          }, options);

          if (! point) {
            return '';
          }

          var icon = point.icon;
          var iconClass;

          var condition = forecastIo.conditionsByIcon[icon];

          if (! condition) {
            return '';
          }
          if (condition.weatherIcon) {
            iconClass = condition.weatherIcon;
          }

          if (! iconClass) {
            iconClass = options.prefix + iconClass;
          }
          return iconClass;
        };


        /**
         * https://developer.forecast.io/docs/v2#data-points
         */
        forecastIo.conditions = {
          clearDay: {
            index: 0,
            icon: 'clear-day',
            summary: 'Clear Day',
            weatherIcon: 'day-sunny'
          },
          clearNight: {
            index: 1,
            icon: 'clear-night',
            summary: 'Clear Night',
            weatherIcon: 'night-clear'
          },
          rain: {
            index: 2,
            icon: 'rain',
            summary: 'Rain',
            weatherIcon: 'rain'
          },
          snow: {
            index: 3,
            icon: 'snow',
            summary: 'Snow',
            weatherIcon: 'snow'
          },
          sleet: {
            index: 4,
            icon: 'sleet',
            summary: 'Sleet',
            weatherIcon: 'sleet'
          },
          wind: {
            index: 5,
            icon: 'wind',
            summary: 'Wind',
            weatherIcon: 'strong-wind'
          },
          fog: {
            index: 6,
            icon: 'fog',
            summary: 'Fog',
            weatherIcon: 'fog'
          },
          cloudy: {
            index: 7,
            icon: 'cloudy',
            summary: 'Cloudy',
            weatherIcon: 'cloudy'
          },
          partlyCloudyDay: {
            index: 8,
            icon: 'partly-cloudy-day',
            summary: 'Partly Cloudy Day',
            weatherIcon: 'day-cloudy'
          },
          partlyCloudNight: {
            index: 9,
            icon: 'partly-cloudy-night',
            summary: 'Partly Cloudy Night',
            weatherIcon: 'night-partly-cloudy'
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
