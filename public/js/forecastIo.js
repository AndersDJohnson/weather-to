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

        var getDeferred;

        forecastIo.get = function (location, fresh) {

          if (! getDeferred || fresh) {
            getDeferred = $q.defer();
          }

          var lat;
          var lng;
          if (location) {
            if (location.coords) {
              lat = location.coords.lat;
              lng = location.coords.lng;
            }
          }
          
          lat = lat || 37.8267;
          lng = lng || -122.423;

          var url;
          // url = '/data/forecast-io_37.8267_-122.423.json';
          url = 'https://api.forecast.io/forecast/' + config.apiKey + '/' + lat + ',' + lng;

          $http.
            jsonp(url, {
              params: {
                callback: 'JSON_CALLBACK'
              }
            }).
            success(function (data, status, headers, config) {
              getDeferred.resolve({
                data: data,
                status: status,
                headers: headers,
                config: config
              });
            }).
            error(function (err) {
              getDeferred.reject(err);
            });
          return getDeferred.promise;
        };

        return forecastIo;
      }];

  }]);

  return forecastIoModule;
});
