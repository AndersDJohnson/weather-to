require([
  'angular',
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
  moment,
  _
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
    'geocoderProvider', 'forecastIoProvider',
    function (geocoderProvider, forecastIoProvider) {

      geocoderProvider.config.google.serverApiKey = 'AIzaSyDmjRbBjb6x4YGyQm8CKG21Kocsix-D3kY';

      forecastIoProvider.config.apiKey = '82f9b0c2328032d8cb168d72ce202fbe';

      // TODO: remove delays in production
      geocoderProvider.config.httpDelayer.delay = 2000;
      forecastIoProvider.config.httpDelayer.delay = 2000;
  }]);


  weatherTo.constant('angularMomentConfig', {
    preprocess: 'unix'
  });


  weatherTo.run([function () {

  }]);


  weatherTo.controller('AppController', [
    '$scope', '$q', '$log', '$rootScope',
    'scopeModal', 'geocoder', 'geolocator', 'forecastIo',
    'categories','locations', 'settings', 'conditionsEngine', 'locationConverter',
    function (
      $scope, $q, $log, $rootScope,
      scopeModal, geocoder, geolocator, forecastIo,
      categories, locations, settings, conditionsEngine, locationConverter
    ) {

      $rootScope.weatherTo = {};
      $rootScope.weatherTo.debug = true;
      $rootScope.$log = $log;

      $scope.modal = scopeModal;


      $scope.current = null;
      $scope.cats = [];
      $scope.locations = [];

      $scope.location = null;

      $scope.settings = settings.settings;

      $scope.format = {
        number: 1,
        numberShort: 0
      };

      $scope.conditions = forecastIo.conditions;
      $scope.conditionsByIcon = forecastIo.conditionsByIcon;
      $scope.getIconClassForPoint = forecastIo.getIconClassForPoint;
      $scope.getIconClassForIcon = forecastIo.getIconClassForIcon;


      $scope.showCategories = function () {
        scopeModal('categories', $scope).
          result.then(function (result) {
            $log.log('result', result);
          });
      };


      $scope.showLocations = function () {
        scopeModal('locations', $scope, {
          windowClass: 'modal-locations'
        });
      };


      $scope.showSettings = function () {
        var settingsFormModel = angular.copy(settings.settings);
        var scope = {
          settingsFormModel: settingsFormModel,
          settingsFormSubmit: function (thisScope) {
            $log.log('settings set', thisScope.settingsFormModel);
            $scope.settings = settings.settings = thisScope.settingsFormModel;
            thisScope.close();
          }
        };
        scopeModal('settings', scope).
          result.then(function (result) {
            $log.log('result', result);
          });
      };


      $scope.showCurrent = function () {
        scopeModal('current', $scope);
      };


      $scope.showAddLocation = function () {
        var addLocationModal = scopeModal('addLocation', $scope, {
          windowClass: 'modal-add-location'
        });
        addLocationModal.result.then(function (result) {
          $log.log('result', result);
        });
      };

      var catFormSubmit = function (thisScope) {
        thisScope.close(thisScope);
        $scope.catFormSubmit();
      };

      $scope.addCategory = function () {
        var catFormModel = {};
        var scope = {
          catFormModel: catFormModel,
          catFormSubmit: catFormSubmit,
          conditions: forecastIo.conditionsSorted
        };
        scopeModal('addCategory', scope).
          result.then(function (result) {
            $log.log('result', result);
            categories.save(result.catFormModel).
              then(function (result) {
                $log.log('saved', result);
              });
          });
      };


      $scope.editCategory = function (cat) {
        var catFormModel = angular.copy(cat);
        var scope = {
          cat: cat,
          catFormModel: catFormModel,
          catFormSubmit: catFormSubmit,
          conditions: forecastIo.conditionsSorted
        };
        $scope.modal('editCategory', scope).
          result.then(function (result) {
            $log.log('result', result);
            categories.save(result.catFormModel).then(function (cat) {
              categories.query().then(function (cats) {
                $scope.$safeApply(function () {
                  $scope.cats = cats;
                });
              });
            });
          });
      };


      $scope.addLocation = function (loc) {
        locations.save(loc).
          then(function (result) {
            $log.log('saved', result);
          });
      };


      $scope.removeLocation = function (loc) {
        locations.remove(loc).then(function (result) {
          $log.log('removed?', result, loc);
        });
      };


      var getCurrentLocation = function () {
        var deferred = $q.defer();
        var promise = deferred.promise;

        geolocator.locate().then(function (position) {
          var location = {
            name: 'Current location',
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };

          // resolve with just coordinates since it's sufficient to request weather
          deferred.resolve(location);
        });

        return promise;
      };


      $scope.getCurrentLocation = function () {

        $scope.location = {
          resolving: true
        };

        getCurrentLocation().then(function (location) {
          location.resolving = true;
          $scope.location = location;

          // setTimeout(function () {
          // now lazily attempt to update the current coordinate location with reverse geocoded city
          geocoder.reverse(location, {
            result_type: 'locality'
          }).
            then(
              function (result) {
                $log.log('reverse result', result);
                var results = result.results;
                if (results && results.length > 0) {
                  var locality = results[0];
                  if (locality && locality.formatted_address) {

                    var convertedLocation = locationConverter.convert(locality);

                    $scope.$safeApply(function () {
                      location.resolving = false;
                      location.name = convertedLocation.name;
                    });
                  }
                }
              },
              function (err) {
                $log.error(err);

                location.resolving = false;
              }
            );
          // }, 1000);
        });
      };


      $scope.onAddressChange = function (address) {
        $log.log('addressChange', address);
        geocoder.get(address).
          then(function (result) {

            var locationResults = _.map(result.results, function (val) {
              var location = locationConverter.convert(val);
              return location;
            });

            $log.log('loc res', locationResults);

            $scope.$safeApply(function () {
              $scope.locationResults = locationResults;
            });
          });
      };


      $scope.pickLocationResult = function (loc) {
        $log.log('picked location result', loc);

        $scope.locationResults = [];

        locations.save(loc).then(function (loc) {
          $scope.setLocation(loc);
        });

      };


      $scope.setLocation = function (loc) {
        $log.log('set location', loc);

        $scope.location = loc;
      };


      $scope.removeCategory = function (cat) {
        categories.remove(cat).then(function (result) {
          $log.log('removed?', result, cat);
        });
      };


      $scope.catFormSubmit = function () {
        $log.log('catFormSubmit', this);
      };


      var _scopingComputeCatsWithCats = function (cats, loc, options) {
        conditionsEngine.computeCats(cats, loc, options).
          then(function (result) {
            $scope.$safeApply(function () {
              $scope.pointSetsByCat = result;
            });
          });
      };

      var scopingComputeCats = function (cats, loc, options) {
        cats = cats || $scope.cats;
        loc = loc || $scope.location;

        if (! cats) {
          categories.query().then(function (cats) {
            $scope.cats = cats;
            $scope.$safeApply();
            _scopingComputeCatsWithCats(cats, loc, options);
          });
        }
        else {
          _scopingComputeCatsWithCats(cats, loc, options);
        }
      };


      var scopingGetForecastForLocation = function (loc, options) {
        $log.log('scopingGetForecastForLocation', arguments);
        forecastIo.get(loc, options).
          then(function (result) {
            // $log.log('current result', result);
            var current = result.currently;
            $scope.$safeApply(function () {
              // this should trigger 'current.time' watch, which re-compute cats
              $scope.current = current;
            });
          });
      };


      $scope.refreshForecast = function () {
        $log.log('refresh forecast', arguments);
        var loc = $scope.location;
        scopingGetForecastForLocation(loc, {
          cache: false
        });
      };


      $scope.$watch('current.time', function () {
        $log.log('current.time change - re-computing cats', arguments);
        scopingComputeCats();
      });


      $scope.$watch('location', function (loc) {
        if (loc) {
          $log.log('location change', arguments);
          scopingGetForecastForLocation(loc);
        }
      }, true);


      $scope.$watch('cats', function (cats) {
        $log.log('cats change', arguments);
        scopingComputeCats(cats);
      }, true);


      $scope.$watch('settings.apparentTemperatures', function () {
        scopingComputeCats();
      }, true);


      // INIT


      categories.query().then(function (cats) {
        $scope.$safeApply(function () {
          $scope.cats = cats;
        });
      });

      locations.query().then(function (locs) {
        $scope.$safeApply(function () {
          $scope.locations = locs;
        });
      });


      $scope.getCurrentLocation();


    }
  ]);


  // weatherTo.controller('TimelineController', [
  //   '$scope', '$q', '$log',
  //   function ($scope, $q, $log) {

  //     var googleLoadDeferred = $q.defer();
  //     var googleLoadPromise = googleLoadDeferred.promise;

  //     var googleOnLoadCallback = function () {
  //       $log.log('google loaded');
  //       googleLoadDeferred.resolve(true);
  //     };

  //     google.setOnLoadCallback(googleOnLoadCallback);

  //     googleLoadPromise.then(function () {
  //       drawChart();

  //       $scope.$watch('cats', function () {
  //         $log.log('watch cats...');
  //         drawChart();
  //       }, true);

  //       $scope.$watch('pointSetsByCat', function () {
  //         $log.log('watch pointSetsByCat...');
  //         drawChart();
  //       }, true);

  //       $scope.$watch('location', function () {
  //         $log.log('watch location...');
  //         drawChart();
  //       }, true);
  //     });

  //     var drawChart = function () {
  //       $log.log('drawing...');

  //       var container = document.getElementById('timeline');
  //       var chart = new google.visualization.Timeline(container);
  //       var dataTable = new google.visualization.DataTable();

  //       dataTable.addColumn({ type: 'string', id: 'President' });
  //       dataTable.addColumn({ type: 'date', id: 'Start' });
  //       dataTable.addColumn({ type: 'date', id: 'End' });
  //       dataTable.addColumn({type: 'string', role: 'tooltip'});

  //       var rows = [];

  //       _.each($scope.cats, function (cat) {

  //         var conditionSets = $scope.pointSetsByCat[cat.id].hourly;

  //         _.each(conditionSets, function (conditionSet) {

  //           var row = [cat.name, conditionSet.first.date, conditionSet.last.date, ''];
  //           row.push();
  //           rows.push(row);
  //         });
  //       });

  //       dataTable.addRows(rows);

  //       // [
  //       //   [ 'Washington', new Date(1789, 3, 29), new Date(1797, 2, 3), 'a' ],
  //       //   [ 'Adams',      new Date(1797, 2, 3),  new Date(1801, 2, 3), 'b' ],
  //       //   [ 'Jefferson',  new Date(1801, 2, 3),  new Date(1809, 2, 3), 'c' ]
  //       // ]);

  //       chart.draw(dataTable);
  //     };

  //   }
  // ]);


  weatherTo.controller('AgendaController',
    ['$scope', 'scopeModal', 'forecastIo', 'categories', 'geocoder', '$q', '$log',
    function ($scope, scopeModal, forecastIo, categories, geocoder, $q, $log) {

      $scope.collapses = {};

    }
  ]);


  weatherTo.controller('CurrentController',
    ['$scope', '$log', 'scopeModal', 'forecastIo', 'conditionsEngine',
    function ($scope, $log, scopeModal, forecastIo, conditionsEngine) {

    }
  ]);


  angular.bootstrap(document, ['weatherTo']);

});
