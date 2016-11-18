/**
 * https://developer.forecast.io/docs/v2
 */
define(['angular', 'lodash', 'httpDelayer'], function (angular, _) {

  var forecastIoModule = angular.module('forecastIo', [
    'httpDelayer'
  ]);


  var config = {
    apiKey: null,
    httpDelayer: {
      id: 'forecastIo',
      delay: null
    }
  };


  forecastIoModule.config([
    '$httpProvider', 'httpDelayer',
    function ($httpProvider, httpDelayer) {
      httpDelayer($httpProvider, config.httpDelayer);
    }
  ]);


  forecastIoModule.provider('forecastIo', [function () {

    this.config = config;

    this.$get = [
      '$log', '$http', '$q',
      function ($log, $http, $q) {

        var forecastIo = {};


        /**
         * https://erikflowers.github.io/weather-icons/
         */
        forecastIo.getIconClassForIcon = function (icon, options) {

          options = _.defaults({}, options, {
            prefix: '' // 'wi-'
          });

          if (! icon) {
            return '';
          }

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

        forecastIo.getIconClassForPoint = function (point) {
          if (! point) {
            return '';
          }
          return forecastIo.getIconClassForIcon(point.icon);
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

        angular.forEach(forecastIo.conditions, function (condition, key) {
          condition.key = key;
        });

        forecastIo.conditionsByIcon = _.transform(forecastIo.conditions, function (result, value) {
          result[value.icon] = value;
        });

        forecastIo.conditionsSorted = _(forecastIo.conditions).
          values().
          sortBy(function (condition) {
            return condition.index;
          })
          .value();


        forecastIo.get = function (coords, options) {

          options = _.defaults({}, options, {
            cache: true
          });

          var deferred = $q.defer();
          var promise = deferred.promise;

          var cache = options.cache;

          var lat;
          var lng;
          if (coords) {
            lat = coords.lat;
            if (! angular.isNumber(lat)) {
              lat = coords.latitude;
            }
            lng = coords.lng;
            if (! angular.isNumber(lng)) {
              lng = coords.longitude;
            }
          }
          else {
            deferred.reject('must provide coords');
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
              id: 'forecastIo',
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
