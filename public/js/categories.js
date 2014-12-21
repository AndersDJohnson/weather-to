define(['angular', 'resourceArray'], function (angular) {

  var categoriesModule = angular.module('categories', ['resourceArray']);

  categoriesModule.provider('categories', [function () {

    this.$get = [
      '$q', '$log', 'resourceArray',
      function ($q, $log, resourceArray) {

        var nextId = 4;

        var cats = [
          {
            id: 1,
            name: 'Ice Skating',
            temperature: {
              min: 0,
              max: 25
            }
          },
          {
            id: 2,
            name: 'Sledding',
            temperature: {
              min: 25,
              max: 32
            }
          },
          {
            id: 3,
            name: 'Jogging',
            temperature: {
              min: 45,
              max: 70
            }
          },
          {
            id: 4,
            name: 'Running',
            temperature: {
              min: 50,
              max: 55
            }
          },
        ];

        var resource = resourceArray(cats, nextId);

        return resource;
      }];

  }]);

  return categoriesModule;

});
