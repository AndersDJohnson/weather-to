require([
  'angular',
  'moment',
  'lodash',
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
  'AngularJS-Scope.SafeApply',
  'goog!visualization,1,packages:[timeline]'
], function (
  angular,
  moment,
  _
) {

  var weatherTo = angular.module('weatherTo',
    [
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
      'locations'
    ]
  );


  weatherTo.config([
    'geocoderProvider', 'forecastIoProvider',
    function (geocoderProvider, forecastIoProvider) {

      geocoderProvider.config.google.serverApiKey = 'AIzaSyDmjRbBjb6x4YGyQm8CKG21Kocsix-D3kY';

      forecastIoProvider.config.apiKey = '82f9b0c2328032d8cb168d72ce202fbe';

  }]);


  weatherTo.constant('angularMomentConfig', {
    preprocess: 'unix'
  });


  weatherTo.run([function () {

  }]);


  weatherTo.service('locationConverter', [
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


  weatherTo.service('conditionsEngine', [
    '$log', 'settings',
    function ($log, settings) {

      var conditionsEngine = {};

      conditionsEngine.getTemperatureFromCondition = function (condition) {
        var temperature;
        if (settings.settings.apparentTemperatures && condition.apparentTemperature) {
          temperature = condition.apparentTemperature;
        }
        else {
          temperature = condition.temperature;
        }
        return temperature;
      };


      conditionsEngine.conditionMatchesCategory = function (cond, cat) {
        if (! cond) {
          $log.warn('no cond:', cond);
          return false;
        }
        if (! cat) {
          $log.warn('no cat:', cat);
          return false;
        }

        var condTemp = conditionsEngine.getTemperatureFromCondition(cond);
        if (! condTemp) {
          $log.warn('no cond temp:', condTemp);
          return false;
        }
        // TODO: apparent temperature support for categories?
        var catTemp = cat.temperature;
        if (! catTemp) {
          $log.warn('no cat temp:', catTemp);
          return false;
        }
        var min = catTemp.min;
        var max = catTemp.max;
        if ( ! ( angular.isNumber(min) && angular.isNumber(max) ) ) {
          $log.warn('no min and max on cat temp:', catTemp);
          return false;
        }
        if (condTemp >= min && condTemp < max) {
          return true;
        }
        return false;
      };

      return conditionsEngine;
    }
  ]);



  weatherTo.controller('AppController', [
    '$scope', '$q', '$log',
    'scopeModal', 'geocoder', 'geolocator', 'forecastIo',
    'categories','locations', 'settings', 'conditionsEngine', 'locationConverter',
    function (
      $scope, $q, $log,
      scopeModal, geocoder, geolocator, forecastIo,
      categories, locations, settings, conditionsEngine, locationConverter
    ) {

      $scope.modal = scopeModal;

      $scope.cats = [];
      $scope.locations = [];

      $scope.location = null;

      $scope.settings = settings.settings;


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
      };


      $scope.showAddLocation = function () {
        var addLocationModal = scopeModal('addLocation', $scope, {
          windowClass: 'modal-add-location'
        });
        addLocationModal.result.then(function (result) {
          $log.log('result', result);
        });
        addLocationModal.opened.then(function () {
          var $el = angular.element('.modal-add-location');
          var $input = $el.find('input[autofocus]').first();
          $input.focus();
        });
      };


      $scope.addCategory = function () {
        var scope = {
          catFormModel: {},
          catFormSubmit: function (thisScope) {
            thisScope.close(thisScope);
            $scope.catFormSubmit();
          }
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
        var scope = {
          catFormModel: angular.copy(cat),
          cat: cat,
          catFormSubmit: function (thisScope) {
            thisScope.close(thisScope);
            $scope.catFormSubmit();
          }
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
                console.log('reverse result', result);
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


      var _computeCatsWithCats = function (cats, location) {

        var deferred = $q.defer();

        var conditionSetsByCat = {};

        forecastIo.get(location).then(function (result) {

          $log.log('cats', cats);
          if (! _.isArray(cats)) {
            throw new Error("cats must be array");
          }
          cats.forEach(function (cat) {

            // TODO: sort by time?

            var sets = [];
            var set;

            var lastMatches = false;

            result.hourly.data.forEach(function (condition) {

              var timePretty = moment.unix(condition.time);
              // condition.timePretty = timePretty.fromNow();
              condition.timePretty = timePretty.calendar();

              condition.durationSeconds = 60 * 60;

              var matches = conditionsEngine.conditionMatchesCategory(condition, cat);

              if (matches) {

                if (! set || ! lastMatches) {
                  set = {
                    items: [],
                    next: null
                  };
                  sets.push(set);
                }

                set.items.push(condition);
              }
              else {
                if (set) {
                  set.next = condition;
                }
              }

              lastMatches = matches;
            });

            sets.forEach(function (set) {
              var items = set.items;
              if (items.length > 0) {
                set.start = items[0].time;
                set.startDate = moment.unix(set.start).toDate();
                var last = items[items.length - 1];
                set.end = last.time;
                set.endDate = moment.unix(set.end).toDate();
                // set.end += last.durationSeconds;
              }
            });

            conditionSetsByCat[cat.id] = sets;

          });

          $log.log('computeCats resolving', conditionSetsByCat);
          deferred.resolve(conditionSetsByCat);

        });

        return deferred.promise;
      };


      var computeCats = function (cats, location) {

        var deferred = $q.defer();

        $log.log('computeCats', arguments);

        if (! cats) {
          categories.query().then(function (cats) {
            deferred.resolve(_computeCatsWithCats(cats, location));
          });
        }
        else {
          deferred.resolve(_computeCatsWithCats(cats, location));
        }

        return deferred.promise;
      };


      var scopingComputeCats = function (cats, loc) {
        cats = cats || $scope.cats;
        loc = loc || $scope.location;
        computeCats(cats, loc).
          then(function (result) {
            $scope.$safeApply(function () {
              $scope.conditionSetsByCat = result;
            });
          });
      };


      $scope.$watch('location', function (loc) {
        if (loc) {
          $log.log('location change', arguments);
          if ( ! $scope.cats || $scope.cats.length === 0 ) {
            categories.query().then(function (cats) {
              $scope.$safeApply(function () {
                $scope.cats = cats;
                // should trigger watch on 'cats'
              });
            });
          }
          else {
            scopingComputeCats(null, loc);
          }
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


    }
  ]);


  weatherTo.controller('TimelineController', [
    '$scope', '$q', '$log',
    function ($scope, $q, $log) {

      var googleLoadDeferred = $q.defer();
      var googleLoadPromise = googleLoadDeferred.promise;

      var googleOnLoadCallback = function () {
        $log.log('google loaded');
        googleLoadDeferred.resolve(true);
      };

      google.setOnLoadCallback(googleOnLoadCallback);

      googleLoadPromise.then(function () {
        drawChart();

        $scope.$watch('cats', function () {
          $log.log('watch cats...');
          drawChart();
        }, true);

        $scope.$watch('conditionSetsByCat', function () {
          $log.log('watch conditionSetsByCat...');
          drawChart();
        }, true);

        $scope.$watch('location', function () {
          $log.log('watch location...');
          drawChart();
        }, true);
      });

      var drawChart = function () {
        $log.log('drawing...');

        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'President' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        dataTable.addColumn({type: 'string', role: 'tooltip'});

        var rows = [];

        _.each($scope.cats, function (cat) {

          var conditionSets = $scope.conditionSetsByCat[cat.id];

          _.each(conditionSets, function (conditionSet) {

            var row = [cat.name, conditionSet.startDate, conditionSet.endDate, ''];
            row.push();
            rows.push(row);
          });
        });

        dataTable.addRows(rows);

        // [
        //   [ 'Washington', new Date(1789, 3, 29), new Date(1797, 2, 3), 'a' ],
        //   [ 'Adams',      new Date(1797, 2, 3),  new Date(1801, 2, 3), 'b' ],
        //   [ 'Jefferson',  new Date(1801, 2, 3),  new Date(1809, 2, 3), 'c' ]
        // ]);

        chart.draw(dataTable);
      };

    }
  ]);


  weatherTo.controller('AgendaController',
    ['$scope', 'scopeModal', 'forecastIo', 'categories', 'geocoder', '$q', '$log',
    function ($scope, scopeModal, forecastIo, categories, geocoder, $q, $log) {

      $scope.collapses = {};

    }
  ]);


  weatherTo.controller('CurrentController',
    ['$scope', '$log', 'scopeModal', 'forecastIo', 'conditionsEngine',
    function ($scope, $log, scopeModal, forecastIo, conditionsEngine) {

    $scope.current = {};

    $scope.getTemperatureFromCondition = conditionsEngine.getTemperatureFromCondition;

    $scope.$watch('location', function (loc) {
      $log.log('location change', arguments);

      if (loc) {
        forecastIo.get(loc).then(function (result) {
          $log.log('current result', result);
          var current = result.currently;
          $scope.current = current;
          // $scope.temperature = conditionsEngine.getTemperatureFromCondition(current);
        });
      }

    }, true);


    }
  ]);


  angular.bootstrap(document, ['weatherTo']);

});
