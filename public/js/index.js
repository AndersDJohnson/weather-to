require([
  'angular',
  'moment',
  'lodash',
  'angular-moment',
  'angular-bootstrap',
  'json-edit',
  'AngularJS-Scope.SafeApply'
], function (
  angular,
  moment,
  _
) {

  var weatherTo = angular.module('weatherTo',
    ['angularMoment', 'ui.bootstrap', 'Scope.safeApply', 'jsonEdit']
  );

  weatherTo.constant('angularMomentConfig', {
    preprocess: 'unix'
  });

  weatherTo.run([function () {

  }]);


  weatherTo.controller('ModalInstanceCtrl',
    ['$scope', '$modalInstance', 'data',
    function ($scope, $modalInstance, data) {

    $scope.data = data;

    $scope.close = function (result) {
      $modalInstance.close(result);
    };

    $scope.dismiss = function (reason) {
      $modalInstance.dismiss(reason);
    };
  }]);


  weatherTo.controller('PredictController',
    ['$scope', '$modal', 'forecast', 'preferences',
    function ($scope, $modal, forecast, prefService) {

    $scope.collapses = {};

    $scope.prefs = [];

    $scope.modal = function (templateId, data) {

      var modalInstance = $modal.open({
        templateUrl: 'templates/modal-' + templateId + '.html',
        controller: 'ModalInstanceCtrl',
        // size: size,
        resolve: {
          data: function () {
            return data;
          }
        }
      });

      return modalInstance;
    };

    $scope.editPref = function (pref) {
      $scope.modal('edit-preference', {pref: pref}).
      result.then(function (result) {
        console.log('result', result);
        $scope.$safeApply(function () {
          prefService.update(result.pref);
          $scope.prefs = prefService.get();
        });
      });
    };


    $scope.$watch('prefs', function (prefs) {

      console.log('prefs change', arguments);

      var conditionSetsByPref = $scope.conditionSetsByPref = {};

      forecast.get().then(function (result) {

        prefs.forEach(function (pref) {

          // TODO: sort by time

          var sets = [];
          var set;

          var lastMatches = false;

          result.data.hourly.data.forEach(function (condition) {

            var timePretty = moment.unix(condition.time);
            // condition.timePretty = timePretty.fromNow();
            condition.timePretty = timePretty.calendar();

            condition.durationSeconds = 60 * 60;

            var matches = forecast.preferenceMatches(pref, condition);

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

          conditionSetsByPref[pref.id] = sets;

        });

      });

    }, true);


    $scope.prefs = prefService.get();


  }]);


  weatherTo.controller('CurrentController',
    ['$scope', '$modal', 'forecast',
    function ($scope, $modal, forecast) {

    $scope.current = {};


    $scope.modal = function (templateId, data) {

      var modalInstance = $modal.open({
        templateUrl: 'templates/modal-' + templateId + '.html',
        controller: 'ModalInstanceCtrl',
        // size: size,
        resolve: {
          data: function () {
            return data;
          }
        }
      });

      return modalInstance;
    };


    forecast.get().then(function (result) {

      $scope.current = result.data.currently;

      console.log('current result', result);

    });

  }]);


  weatherTo.service('preferences', [ function () {

    var preferences = {};

    var prefs = [
      {
        id: 1,
        name: 'Sledding',
        temperature: {
          min: 30,
          max: 40
        }
      },
      {
        id: 2,
        name: 'Jogging',
        temperature: {
          min: 54,
          max: 56
        }
      },
      {
        id: 3,
        name: 'Running',
        temperature: {
          min: 50,
          max: 53
        }
      },
    ];

    preferences.get = function () {
      return prefs;
    };

    preferences.update = function (data) {
      console.log('update', data);
      var id = data.id;
      var pref = _.findWhere(prefs, {id: id});
      var cloned = _.cloneDeep(data);
      delete cloned.id;
      _.extend(pref, cloned);
    };

    return preferences;
  }]);


  /**
   * https://developer.forecast.io/docs/v2#forecast_call
   */
  weatherTo.service('forecast', ['$http', '$q', function ($http, $q) {
    var forecast = {};

    forecast.random = Math.random();

    var getDeferred;

    forecast.get = function (fresh) {
      if (! getDeferred || fresh) {
        getDeferred = $q.defer();
      }
      $http.
        get('/data/forecast-io_37.8267_-122.423.json').
        success(function (data, status, headers, config) {
          getDeferred.resolve({
            data: data,
            status: status,
            headers: headers,
            config: config
          });
        }).
        error(function (err) {
          getDeferred.reject(err);
        });
      return getDeferred.promise;
    };

    forecast.preferenceMatches = function (pref, cond) {
      if (cond.temperature) {
        var condTemp = cond.temperature;
        var prefTemp = pref.temperature;
        if (condTemp >= prefTemp.min && condTemp < prefTemp.max) {
          return true;
        }
      }
      return false;
    };

    return forecast;
  }]);


  angular.bootstrap(document, ['weatherTo']);

});
