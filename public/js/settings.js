define(['angular'], function (angular) {

  var settingsModule = angular.module('settings', []);

  settingsModule.provider('settings', [function () {

    var settings = this.settings = {
      apparentTemperatures: false
    };

    this.$get = [
      '$q', '$log',
      function ($q, $log) {

        var settings = {};

        settings.settings = settings;

        return settings;
      }
    ];

  }]);

  return settingsModule;
});
