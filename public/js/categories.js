define(['angular'], function (angular) {

  var categoriesModule = angular.module('categories', []);

  categoriesModule.provider('categories', [function () {

    this.$get = [
      '$q', function ($q) {

        var categories = {};

        var cats = [
          {
            id: 1,
            name: 'Sledding',
            temperature: {
              min: 30,
              max: 40
            }
          },
          {
            id: 2,
            name: 'Jogging',
            temperature: {
              min: 54,
              max: 56
            }
          },
          {
            id: 3,
            name: 'Running',
            temperature: {
              min: 50,
              max: 53
            }
          },
        ];

        categories.get = function () {
          var deferred = $q.defer();

          deferred.resolve(cats);

          return deferred.promise;
        };

        categories.update = function (data) {
          var deferred = $q.defer();

          console.log('update', data);
          var id = data.id;
          var cat = _.findWhere(cats, {id: id});
          var cloned = _.cloneDeep(data);
          delete cloned.id;
          _.extend(cat, cloned);

          deferred.resolve(cat);

          return deferred.promise;
        };

        return categories;
      }];

  }]);

  return categoriesModule;

});
