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
  'AngularJS-Scope.SafeApply'
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


  weatherTo.controller('PredictController',
    ['$scope', 'scopeModal', 'forecastIo', 'categories', 'geocoder', '$q', '$log',
    function ($scope, scopeModal, forecastIo, categories, geocoder, $q, $log) {


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


    $scope.collapses = {};

    $scope.cats = [];

    $scope.modal = scopeModal;


    $scope.editCat = function (cat) {
      $scope.modal('edit-category', {cat: cat}).
      result.then(function (result) {
        $log.log('result', result);
        categories.update(result.cat).then(function (cat) {
          categories.get().then(function (cats) {
            $scope.$safeApply(function () {
              $scope.cats = result;
            });
          });
        });
      });
    };


    var _computeCatsWithCats = function (cats, location, fresh) {

      var deferred = $q.defer();

      var conditionSetsByCat = {};

      forecastIo.get(location, fresh).then(function (result) {

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
              var last = items[items.length - 1];
              set.end = last.time;
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

    var computeCats = function (cats, location, fresh) {

      var deferred = $q.defer();

      $log.log('deferred', deferred);

      $log.log('computeCats', arguments);

      if (! cats) {
        categories.get().then(function (cats) {
          deferred.resolve(_computeCatsWithCats(cats, location, fresh));
        });
      }
      else {
        deferred.resolve(_computeCatsWithCats(cats, location, fresh));
      }

      return deferred.promise;
    };


    $scope.$watch('location', function (loc) {
      $log.log('location change', arguments);
      computeCats(null, loc, true).
      then(function (result) {
        $log.log('watch loc result', result);
        $scope.$safeApply(function () {
          $scope.conditionSetsByCat = result;
        });
      });
    }, true);


    $scope.$watch('cats', function (cats) {
      $log.log('cats change', arguments);
      computeCats(cats, $scope.location, false).
      then(function (result) {
        $scope.$safeApply(function () {
          $scope.conditionSetsByCat = result;
        });
      });
    }, true);


    categories.get().then(function (cats) {
      $scope.$safeApply(function () {
        $scope.cats = cats;
      });
    });


  }]);


  weatherTo.controller('CurrentController',
    ['$scope', 'scopeModal', 'forecastIo', '$log',
    function ($scope, scopeModal, forecastIo, $log) {

    $scope.current = {};


    $scope.modal = scopeModal;


    forecastIo.get().then(function (result) {
      $log.log('current result', result);
      $scope.current = result.data.currently;
    });

  }]);


  angular.bootstrap(document, ['weatherTo']);

});
