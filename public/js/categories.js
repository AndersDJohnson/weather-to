define(['angular'], function (angular) {

  var categoriesModule = angular.module('categories', []);

  categoriesModule.provider('categories', [function () {

    this.$get = [
      '$q', '$log',
      function ($q, $log) {

        var categories = {};

        var nextId = 4;

        var cats = [
          {
            id: 1,
            name: 'Sledding',
            temperature: {
              min: 55,
              max: 62
            }
          },
          {
            id: 2,
            name: 'Jogging',
            temperature: {
              min: 50,
              max: 56
            }
          },
          {
            id: 3,
            name: 'Running',
            temperature: {
              min: 50,
              max: 55
            }
          },
        ];

        categories.query = function () {
          var deferred = $q.defer();
          var promise = deferred.promise;

          deferred.resolve(cats);

          return promise;
        };


        /**
         * Remove by cat or id.
         */
        categories.remove = function (cat) {
          var deferred = $q.defer();
          var promise = deferred.promise;

          if (_.isPlainObject(cat)) {
            id = cat.id;
          }
          else {
            id = cat;
          }

          if (! id) {
            $log.error('must provide id');
            deferred.reject('must provide id');
            return promise;
          }

          var index = _.findIndex(cats, {id: id});

          // remove it
          cats.splice(index, 1);

          deferred.resolve(true);

          return promise;
        };


        categories.save = function (data) {

          var deferred = $q.defer();
          var promise = deferred.promise;

          if (! data) {
            $log.error('must provide data');
            deferred.reject('must provide data');
            return promise;
          }

          // clone data to prevent modification
          data = _.cloneDeep(data);

          console.log('save', data);
          var id = data.id;

          if (id) {

            var cat = _.findWhere(cats, {id: id});
            delete data.id;
            _.extend(cat, data);

          }
          else {

            data.id = nextId++;
            cats.push(data);

          }

          deferred.resolve(cat);

          return promise;
        };

        return categories;
      }];

  }]);

  return categoriesModule;

});
