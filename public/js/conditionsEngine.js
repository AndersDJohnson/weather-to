define([
  'angular',
  'moment',
  'lodash'
],
function (
  angular,
  moment,
  _
) {

  var conditionsEngineModule = angular.module('conditionsEngine', [
    'categories'
  ]);

  conditionsEngineModule.service('conditionsEngine', [
    '$log', '$q', 'forecastIo', 'settings',
    function ($log, $q, forecastIo, settings) {

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


      conditionsEngine.pointMatchesCategory = function (point, cat) {
        if (! point) {
          $log.warn('no point:', point);
          return false;
        }
        if (! cat) {
          $log.warn('no cat:', cat);
          return false;
        }

        var matches = false;

        var pointTemp = conditionsEngine.getTemperatureFromCondition(point);
        if (! pointTemp) {
          $log.warn('no point temp:', pointTemp);
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

        if (pointTemp >= min && pointTemp < max) {
          matches = true;
        }

        if (matches) {
          if (cat.conditionsEnabled) {
            var pointIcon = point.icon;
            var catconditions = point.conditions;

            _.forEach(catconditions, function (catpointition) {
              var pointition = forecastIo.conditions[catpointition.key];
              if (pointition.icon && pointition.icon == pointIcon) {
                matches = true;
                return false;
              }
            });
          }
        }

        return matches;
      };


      conditionsEngine._computeCatsWithCats = function (cats, location) {

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

            var hourlyData = result.hourly.data || [];

            hourlyData.forEach(function (point) {

              var timePretty = moment.unix(point.time);
              // condition.timePretty = timePretty.fromNow();
              point.timePretty = timePretty.calendar();

              point.durationSeconds = 60 * 60;

              var matches = conditionsEngine.pointMatchesCategory(point, cat);

              if (matches) {

                if (! set || ! lastMatches) {
                  set = {
                    points: [],
                    next: null,
                    conditions: {}
                  };
                  sets.push(set);
                }

                set.conditions[point.icon] = true;

                set.points.push(point);
              }
              else {
                if (set) {
                  set.next = point;
                }
              }

              lastMatches = matches;
            });

            sets.forEach(function (set) {
              var points = set.points;
              if (! points) {
                return;
              }

              var length = points.length;
              if (length === 0) {
                return;
              }

              // get time span

              set.start = points[0].time;
              set.startDate = moment.unix(set.start).toDate();
              var last = points[length - 1];
              set.end = last.time;
              set.endDate = moment.unix(set.end).toDate();

              // get averages

              var totals = {};
              _.forEach(points, function (point) {
                totals.temperature = totals.temperature || 0;
                totals.temperature += point.temperature;
                totals.apparentTemperature = totals.apparentTemperature || 0;
                totals.apparentTemperature += point.apparentTemperature;
                // TODO: more fields
              });

              var averages = {};
              _.forEach(totals, function (total, key) {
                averages[key] = total / length;
              });

              set.averages = averages;

              $log.log('averages', averages, totals, points);

            });

            conditionSetsByCat[cat.id] = sets;

          });

          $log.log('computeCats resolving', conditionSetsByCat);
          deferred.resolve(conditionSetsByCat);

        });

        return deferred.promise;
      };


      conditionsEngine.computeCats = function (cats, location) {

        var deferred = $q.defer();

        $log.log('computeCats', arguments);

        if (! cats) {
          deferred.reject('must provide cats');
        }

        deferred.resolve(conditionsEngine._computeCatsWithCats(cats, location));

        return deferred.promise;
      };


      return conditionsEngine;
    }
  ]);


  return conditionsEngineModule;
});
