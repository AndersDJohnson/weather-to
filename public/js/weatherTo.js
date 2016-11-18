define([
    'angular',
    'controllers/AppController',
    'controllers/AgendaController',
    'controllers/CurrentController',
    'moment',
    'lodash',
    'bootstrap',
    'angular-messages',
    'angular-aria',
    'angular-moment',
    'angular-bootstrap',
    'jsonEdit',
    'modal',
    'geocoder',
    'geolocator',
    'forecastIo',
    'settings',
    'categories',
    'locations',
    'locationConverter',
    'conditionsEngine',
    'AngularJS-Scope.SafeApply'//,
  // 'goog!visualization,1,packages:[timeline]'
], function (
  angular,
  AppController,
  AgendaController,
  CurrentController
) {

    var weatherTo = angular.module('weatherTo',
        [
            'ngMessages',
            'ngAria',
            'angularMoment',
            'ui.bootstrap',
            'Scope.safeApply',
            'jsonEdit',
            'modal',
            'geocoder',
            'geolocator',
            'forecastIo',
            'settings',
            'categories',
            'locations',
            'locationConverter',
            'conditionsEngine'
        ]
  );


    weatherTo.config([
        'geocoderProvider', 'forecastIoProvider', 'geolocatorProvider',
        function (geocoderProvider, forecastIoProvider, geolocatorProvider) {

            geocoderProvider.config.google.serverApiKey = 'AIzaSyDmjRbBjb6x4YGyQm8CKG21Kocsix-D3kY';

            forecastIoProvider.config.apiKey = '82f9b0c2328032d8cb168d72ce202fbe';

      // TODO: don't leave delays in production - only for test/dev
      // geocoderProvider.config.httpDelayer.delay = 2000;
      // forecastIoProvider.config.httpDelayer.delay = 2000;
      // geolocatorProvider.config.delay = 2000;

      // geolocatorProvider.config.fail = true;
        }]);


    weatherTo.constant('angularMomentConfig', {
        preprocess: 'unix'
    });


    weatherTo.run(['$log', function ($log) {
        $log.log('running...');
    }]);


    weatherTo.controller('AppController', AppController);

    weatherTo.controller('AgendaController', AgendaController);

    weatherTo.controller('CurrentController', CurrentController);


    return weatherTo;
});
