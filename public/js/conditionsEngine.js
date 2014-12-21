define(['angular'], function (angular) {

  var conditionsEngineModule = angular.module('conditionsEngine', []);

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


      conditionsEngine.computeCats = function (cats, location) {

        var deferred = $q.defer();

        $log.log('computeCats', arguments);

        if (cats) {
          deferred.resolve(conditionsEngine._computeCatsWithCats(cats, location));
        }
        else {
          categories.query().then(function (cats) {
            deferred.resolve(conditionsEngine._computeCatsWithCats(cats, location));
          });
        }

        return deferred.promise;
      };


      return conditionsEngine;
    }
  ]);


  return conditionsEngineModule;
});
