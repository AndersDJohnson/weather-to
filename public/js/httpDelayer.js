define(['angular'], function (angular) {

  var httpDelayerModule = angular.module('httpDelayer', []);

  /**
   * Must keep options reference object to allow later overrides.
   */
  var httpDelayer = function ($httpProvider, options) {

    options.delay = options.delay || 0;
    options.id = options.id || null;

    $httpProvider.interceptors.push([
      '$log', '$q', '$timeout',
      function($log, $q, $timeout) {
        return {
          response: function(response) {
            var defer = $q.defer();
            var promise = defer.promise;

            var id = options.id;
            if (id) {
              var configId = response.config.id;
              if (! angular.isArray(configId)) {
                configId = [configId];
              }

              // TODO: wildcard matching?
              if (configId.indexOf(id) === -1) {
                // if not match, don't delay
                defer.resolve(response);
                return promise;
              }
            }

            var delay = options.delay;
            $log.log('http delay', delay, response.config.url, response);
            $timeout(function() {
              defer.resolve(response);
            }, delay);

            return promise;
          }
        };
      }
    ]);
  };

  httpDelayerModule.constant('httpDelayer', httpDelayer);

  return httpDelayerModule;
});
