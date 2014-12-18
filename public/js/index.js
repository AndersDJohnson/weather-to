require([
  'angular',
  'moment',
  'lodash',
  'angular-moment',
  'angular-bootstrap'
], function (
  angular,
  moment,
  _
) {

  var weatherTo = angular.module('weatherTo',
    ['angularMoment', 'ui.bootstrap']
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

    $scope.dismiss = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);


  weatherTo.controller('PredictController',
    ['$scope', 'forecast', '$modal', function ($scope, forecast, $modal) {

    $scope.prefs = [];

    $scope.modal = function (templateId, data) {

      var modalInstance = $modal.open({
        templateUrl: 'templates/modal-' + templateId + '.html',
        backdrop: true,
        controller: 'ModalInstanceCtrl',
        // size: size,
        resolve: {
          data: function () {
            return data;
          }
        }
      });

    };

    var preferences = [
      {
        name: 'sledding',
        temperature: {
          min: 30,
          max: 40
        }
      },
      {
        name: 'jogging',
        temperature: {
          min: 54,
          max: 56
        }
      },
      {
        name: 'running',
        temperature: {
          min: 50,
          max: 53
        }
      },
    ];

    forecast.get().then(function (result) {

      preferences.forEach(function (pref) {
        pref.conditionMatches = [];

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
            pref.conditionMatches.push(condition);

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

        pref.conditionSets = sets;

      });

      $scope.prefs = preferences;
    });

  }]);


  /**
   * https://developer.forecast.io/docs/v2#forecast_call
   */
  weatherTo.service('forecast', ['$http', '$q', function ($http, $q) {
    var forecast = {};

    forecast.get = function () {
      var q = $q.defer();
      $http.
        get('/data/forecast-io_37.8267_-122.423.json').
        success(function (data, status, headers, config) {
          q.resolve({
            data: data,
            status: status,
            headers: headers,
            config: config
          });
        }).
        error(function (err) {
          q.reject(err);
        });
      return q.promise;
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
