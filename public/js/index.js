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
    ['$scope', '$modal', 'forecast', 'preferences', 'geocode', '$q',
    function ($scope, $modal, forecast, prefService, geocode, $q) {


    $scope.onAddressChange = function () {
      var address = $scope.address;
      console.log('on addressChange', address);
      geocode.get(address).
        then(function (result) {
          console.log('geocode result 1', result);
          console.log('geocode result 2', result.data);
          console.log('geocode result 3', result.data.results);

          var locationResults = _.map(result.data.results, function (val) {
            return {
              name: val && val.formatted_address,
              coords: val && val.geometry && val.geometry.viewport && val.geometry.viewport.northeast
            };
          });
          console.log('locationResults', locationResults);
          $scope.$safeApply(function () {
            $scope.locationResults = locationResults;
          });
        });
    };

    $scope.pickLocation = function (loc) {
      console.log('picked location', loc);

      $scope.location = loc;
    };


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



    var computePrefs = function (prefs, location, fresh) {

      var deferred = $q.defer();

      console.log('computePrefs', arguments);

      if (! prefs) {
        prefs = prefService.get();
      }

      var conditionSetsByPref = {};

      forecast.get(location, fresh).then(function (result) {

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

          pref.conditionSets = sets;

        });

        console.log('computePrefs resolving', conditionSetsByPref);
        deferred.resolve(conditionSetsByPref);

      });

      return deferred.promise;
    };


    $scope.$watch('location', function (loc) {
      console.log('location change', arguments);
      computePrefs(null, loc, true).
      then(function (result) {
        console.log('watch loc result', result);
        $scope.$safeApply(function () {
          $scope.conditionSetsByPref = result;
        });
      });
    }, true);


    $scope.$watch('prefs', function (prefs) {
      console.log('prefs change', arguments);
      computePrefs(prefs, $scope.location, false).
      then(function (result) {
        $scope.$safeApply(function () {
          $scope.conditionSetsByPref = result;
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
  weatherTo.service('geocode', ['$http', '$q', function ($http, $q) {
    var geocode = {};

    geocode.get = function (address) {
      var deferred = $q.defer();

      console.log('geocoding address', address);

      var geocodingApiKey = 'AIzaSyB5XluVN28xvRR81T-uiPWKhXUt7yBzp9A';
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?';
      url += 'key=' + escape(geocodingApiKey);
      url += '&address=' + escape(address);

      $http.
        get(url).
        success(function (data, status, headers, config) {
          deferred.resolve({
            data: data,
            status: status,
            headers: headers,
            config: config
          });
        }).
        error(function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    };

    return geocode;
  }]);


  /**
   * https://developer.forecast.io/docs/v2#forecast_call
   */
  weatherTo.service('forecast', ['$http', '$q', function ($http, $q) {
    var forecast = {};

    forecast.random = Math.random();

    var getDeferred;

    forecast.get = function (location, fresh) {

      if (! getDeferred || fresh) {
        getDeferred = $q.defer();
      }

      var lat;
      var lng;
      if (location) {
        if (location.coords) {
          lat = location.coords.lat;
          lng = location.coords.lng;
        }
      }
      
      lat = lat || 37.8267;
      lng = lng || -122.423;

      var url;
      // url = '/data/forecast-io_37.8267_-122.423.json';
      var forecastApiKey = '82f9b0c2328032d8cb168d72ce202fbe';
      url = 'https://api.forecast.io/forecast/' + forecastApiKey + '/' + lat + ',' + lng;

      $http.
        jsonp(url, {
          params: {
            callback: 'JSON_CALLBACK'
          }
        }).
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
