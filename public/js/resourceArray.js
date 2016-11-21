define([
  'angular',
  'lodash',
  'angular-local-storage'
],
function (
  angular,
  _
) {

  var resourceArrayModule = angular.module('resourceArray', [
    'LocalStorageModule'
  ]);

  resourceArrayModule.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('weather-to:resourceArray');
  }]);

  resourceArrayModule.provider('resourceArray', [function () {

    this.$get = [
      '$q', '$log', 'localStorageService',
      function ($q, $log, localStorageService) {

        /**
         * @param name Name of resource.
         * @param array Default items (if not started).
         */
        var resourceArray = function (name, array) {

          array = array || [];

          var existing = localStorageService.get(name + '.data') || [];

          var started = localStorageService.get(name + '.started');

          if (started && angular.isArray(existing) && existing.length > 0) {
            // ignore default items if started and existing is valid array with items
            array = existing;
          }

          localStorageService.set(name + '.started', true);

          var nextId = localStorageService.get(name + '.nextId');
          nextId = nextId || (array.length + 1);

          var resource = {};


          resource.reset = function () {
            localStorageService.remove(name + '.started');
          };


          resource.query = function () {
            var deferred = $q.defer();
            var promise = deferred.promise;

            deferred.resolve(array);

            return promise;
          };


          /**
           * Remove by item or id.
           */
          resource.remove = function (item) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            var id;

            if (_.isPlainObject(item)) {
              id = item.id;
            }
            else {
              id = item;
            }

            if (! id) {
              $log.error('must provide id');
              deferred.reject('must provide id');
              return promise;
            }

            var index = _.findIndex(array, {id: id});

            // remove it
            array.splice(index, 1);

            localStorageService.set(name + '.data', array);

            deferred.resolve(true);

            return promise;
          };


          resource.save = function (data) {

            var deferred = $q.defer();
            var promise = deferred.promise;

            if (! data) {
              $log.error('must provide data');
              deferred.reject('must provide data');
              return promise;
            }

            // clone data to prevent modification
            data = _.cloneDeep(data);

            $log.log('save', data);
            var id = data.id;

            var item;

            if (id) {

              item = _.findWhere(array, {id: id});
              delete data.id;
              _.extend(item, data);

            }
            else {

              data.id = nextId++;
              array.push(data);
              item = data;

            }

            localStorageService.set(name + '.data', array);

            deferred.resolve(item);

            return promise;
          };

          return resource;
        };

        return resourceArray;
      }];

  }]);

  return resourceArrayModule;
});
