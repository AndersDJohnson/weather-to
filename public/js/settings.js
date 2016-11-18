define(['angular'], function (angular) {

  var settingsModule = angular.module('settings', []);

  settingsModule.provider('settings', [function () {

    var settingsObject = this.settingsObject = {
      apparentTemperatures: false
    };

    this.$get = [
      function () {

        var settings = {};

        settings.settings = settingsObject;

        return settings;
      }
    ];

  }]);

  return settingsModule;
});
