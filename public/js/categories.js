define(['angular', 'resourceArray'], function (angular) {

  var categoriesModule = angular.module('categories', ['resourceArray']);

  categoriesModule.provider('categories', [function () {

    this.$get = [
      '$q', '$log', 'resourceArray',
      function ($q, $log, resourceArray) {

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
              min: 32,
              max: 90
            },
            'conditionsEnabled': true,
            'conditions': {
              'partlyCloudNight': true,
              'partlyCloudyDay': true,
              'cloudy': true,
              'fog': false,
              'wind': false,
              'snow': false,
              'clearNight': true,
              'clearDay': true
            }
          },
          {
            id: 4,
            name: 'Swimming',
            temperature: {
              min: 60,
              max: 110
            }
          }
        ];

        var resource = resourceArray('categories', cats);

        return resource;
      }];

  }]);

  return categoriesModule;

});
