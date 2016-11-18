define(['angular', 'resourceArray'], function (angular) {

    var locationsModule = angular.module('locations', ['resourceArray']);

    locationsModule.provider('locations', [function () {

        this.$get = [
            '$q', '$log', 'resourceArray',
            function ($q, $log, resourceArray) {

                var locations = [];

                var resource = resourceArray(locations);

                return resource;
            }];

    }]);

    return locationsModule;

});
