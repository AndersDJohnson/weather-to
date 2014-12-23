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

      conditionsEngine.getTemperatureMinFromCondition = function (condition) {
        var temperatureMin;
        if (settings.settings.apparentTemperatures && condition.apparentTemperature) {
          temperatureMin = condition.apparentTemperatureMin;
        }
        else {
          temperatureMin = condition.temperatureMin;
        }
        return temperatureMin;
      };

      conditionsEngine.getTemperatureMaxFromCondition = function (condition) {
        var temperatureMax;
        if (settings.settings.apparentTemperatures && condition.apparentTemperature) {
          temperatureMax = condition.apparentTemperatureMax;
        }
        else {
          temperatureMax = condition.temperatureMax;
        }
        return temperatureMax;
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
        var pointTempMin;
        var pointTempMax;
        if (! pointTemp) {
          pointTempMin = conditionsEngine.getTemperatureMinFromCondition(point);
          pointTempMax = conditionsEngine.getTemperatureMaxFromCondition(point);
        }
        else {
          pointTempMin = pointTemp;
          pointTempMax = pointTemp;
        }
        if (! (pointTempMin && pointTempMax)) {
          $log.warn('no point temp min or max:', pointTempMin, pointTempMax);
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

        if (pointTempMin >= min && pointTempMax < max) {
          matches = true;
        }

        if (matches) {
          if (cat.conditionsEnabled) {
            var pointIcon = point.icon;
            var catconditions = point.conditions;

            _.forEach(catconditions, function (catCondition) {
              var condition = forecastIo.conditions[catCondition.key];
              if (condition.icon && condition.icon == pointIcon) {
                matches = true;
                return false;
              }
            });
          }
        }

        return matches;
      };


      var newSet = function () {
        var set = {
          points: [],
          next: null,
          conditions: {},
          start: null,
          startDate: null,
          end: null,
          endDate: null
        };
        return set;
      };


      conditionsEngine._computeCatsWithCats = function (cats, location) {

        var deferred = $q.defer();

        var pointSetsByCat = {};

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
            var dailyData = result.daily.data || [];

            hourlyData.forEach(function (point) {

              point.type = 'hourly';

              var timePretty = moment.unix(point.time);
              // condition.timePretty = timePretty.fromNow();
              point.timePretty = timePretty.calendar();

              point.durationSeconds = 60 * 60;

              var matches = conditionsEngine.pointMatchesCategory(point, cat);

              if (matches) {

                if (! set || ! lastMatches) {
                  set = newSet();
                  set.type = 'hourly';
                  sets.push(set);
                }

                var conditionsKey = point.summary + '-' + point.icon;
                set.conditions[conditionsKey] = {
                  icon: point.icon,
                  summary: point.summary
                };

                set.points.push(point);
              }
              else {
                if (set) {
                  set.next = point;
                }
              }

              lastMatches = matches;
            });


            var daily = [];

            dailyData.forEach(function (point) {

              point.type = 'daily';

              var timePretty = moment.unix(point.time);
              // condition.timePretty = timePretty.fromNow();
              point.timePretty = timePretty.calendar();

              var matches = conditionsEngine.pointMatchesCategory(point, cat);

              if (matches) {
                var set = newSet();
                set.type = 'daily';

                set.first = point;

                daily.push(set);
              }
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

              var first = set.first = points[0];
              var last = set.last = points[length - 1];

              first.date = moment.unix(first.time).toDate();
              last.date = moment.unix(last.time).toDate();


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
            });

            var pointSet = pointSetsByCat[cat.id] = pointSetsByCat[cat.id] || {};

            pointSet.hourly = sets;
            pointSet.daily = daily;

            var all = [].concat(sets).concat(daily);

            all = _.sortBy(all, function (pointSet) {
              return pointSet.first.time;
            });

            pointSet.all = all;

          });


          $log.log('computeCats resolving', pointSetsByCat);
          deferred.resolve(pointSetsByCat);

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
