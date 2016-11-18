define(['angular'], function (angular) {

  var locationConverterModule = angular.module('locationConverter', []);

  locationConverterModule.factory('locationConverter', [
    function () {

      var locationConverter = {};

      locationConverter.convert = function (val) {
        return {
          name: val && val.formatted_address,
          coords: val && val.geometry && val.geometry.viewport && val.geometry.viewport.northeast
        };
      };

      return locationConverter;
    }
  ]);

  return locationConverterModule;
});
