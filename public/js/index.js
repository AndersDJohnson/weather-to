require([
  'angular',
  'moment',
  'lodash',
  'angular-moment',
  'angular-bootstrap',
  'jsonEdit',
  'modal',
  'geocoder',
  'forecastIo',
  'categories',
  'AngularJS-Scope.SafeApply',
  'goog!visualization,1,packages:[timeline]'
], function (
  angular,
  moment,
  _
) {

  var weatherTo = angular.module('weatherTo',
    [
      'angularMoment',
      'ui.bootstrap',
      'Scope.safeApply',
      'jsonEdit',
      'modal',
      'geocoder',
      'forecastIo',
      'categories'
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



  var categoryMatches = function (cat, cond) {
    if (cond.temperature) {
      var condTemp = cond.temperature;
      var catTemp = cat.temperature;
      if (condTemp >= catTemp.min && condTemp < catTemp.max) {
        return true;
      }
    }
    return false;
  };


  weatherTo.controller('AppController', [
    '$scope', 'scopeModal', 'forecastIo', 'categories', 'geocoder', '$q', '$log',
    function ($scope, scopeModal, forecastIo, categories, geocoder, $q, $log) {

      $scope.modal = scopeModal;

      $scope.cats = [];


      $scope.addCategory = function () {
        scopeModal('addCategory').
          result.then(function (result) {
            $log.log('result', result);
            categories.save(result.cat).
              then(function (result) {
                $log.log('saved', result);
              });
          });
      };

      $scope.addLocation = function () {
        scopeModal('addLocation');
      };


      $scope.onAddressChange = function () {
        var address = $scope.address;
        $log.log('on addressChange', address);
        geocoder.get(address).
          then(function (result) {

            var locationResults = _.map(result.data.results, function (val) {
              return {
                name: val && val.formatted_address,
                coords: val && val.geometry && val.geometry.viewport && val.geometry.viewport.northeast
              };
            });

            $scope.$safeApply(function () {
              $scope.locationResults = locationResults;
            });
          });
      };

      $scope.pickLocation = function (loc) {
        $log.log('picked location', loc);

        $scope.location = loc;
      };


      $scope.editCategory = function (cat) {
        $scope.modal('editCategory', {cat: cat}).
          result.then(function (result) {
            $log.log('result', result);
            categories.save(result.cat).then(function (cat) {
              categories.query().then(function (cats) {
                $scope.$safeApply(function () {
                  $scope.cats = result;
                });
              });
            });
          });
      };

      $scope.removeCategory = function (cat) {
        categories.remove(cat).then(function (result) {
          $log.log('removed?', result, cat);
        });
      };


      var _computeCatsWithCats = function (cats, location) {

        var deferred = $q.defer();

        var conditionSetsByCat = {};

        forecastIo.get(location).then(function (result) {

          cats.forEach(function (cat) {

            // TODO: sort by time?

            var sets = [];
            var set;

            var lastMatches = false;

            result.data.hourly.data.forEach(function (condition) {

              var timePretty = moment.unix(condition.time);
              // condition.timePretty = timePretty.fromNow();
              condition.timePretty = timePretty.calendar();

              condition.durationSeconds = 60 * 60;

              var matches = categoryMatches(cat, condition);

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


      $scope.$watch('location', function (loc) {
        $log.log('location change', arguments);
        computeCats(null, loc).
        then(function (result) {
          $log.log('watch loc result', result);
          $scope.$safeApply(function () {
            $scope.conditionSetsByCat = result;
          });
        });
      }, true);


      $scope.$watch('cats', function (cats) {
        $log.log('cats change', arguments);
        computeCats(cats, $scope.location).
        then(function (result) {
          $scope.$safeApply(function () {
            $scope.conditionSetsByCat = result;
          });
        });
      }, true);


      categories.query().then(function (cats) {
        $scope.$safeApply(function () {
          $scope.cats = cats;
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


  weatherTo.controller('PredictController',
    ['$scope', 'scopeModal', 'forecastIo', 'categories', 'geocoder', '$q', '$log',
    function ($scope, scopeModal, forecastIo, categories, geocoder, $q, $log) {

      $scope.collapses = {};

    }
  ]);


  weatherTo.controller('CurrentController',
    ['$scope', 'scopeModal', 'forecastIo', '$log',
    function ($scope, scopeModal, forecastIo, $log) {

    $scope.current = {};

    forecastIo.get().then(function (result) {
      $log.log('current result', result);
      $scope.current = result.data.currently;
    });

    }
  ]);


  angular.bootstrap(document, ['weatherTo']);

});
