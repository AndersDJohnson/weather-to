define([
    'angular',
    'lodash'
], function (
    angular,
    _
) {
    return [
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

            $scope.refreshing = true;
            $scope.refreshingLocation = false;
            $scope.refreshingForecast = false;

            $scope.forecast = null;
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


            var showGetLocationError = function (
              //err
            ) {
                // scopeModal('getLocationError', $scope);
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
                    categories.save(result.catFormModel).then(function () {
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


            var _getCurrentPosition = function () {
                var deferred = $q.defer();
                var promise = deferred.promise;

                geolocator.locate().
                then(
                    function (position) {
                        // resolve with just coordinates since it's sufficient to request weather
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );

                return promise;
            };


            $scope.getCurrentLocation = function () {

                $scope.$safeApply(function () {
                    $scope.locationError = null;
                    $scope.refreshingLocation = true;

                    $scope.location = {
                        name: 'Current location',
                        resolving: false
                    };
                });

                var promise = _getCurrentPosition();

                var error = function (err) {
                    $log.error(err);
                    // deferred.reject(err);
                    return promise;
                };

                promise.
                then(function (position) {

                    $scope.$safeApply(function () {
                        $scope.location.coords = position.coords;
                        $scope.location.resolving = true;
                    });

                        // now lazily attempt to update the current coordinate location with reverse geocoded city
                    geocoder.reverse(position, {
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
                                            $scope.location.resolving = false;
                                            $scope.location.name = 'Current location (' + convertedLocation.name + ')';
                                        });
                                    }
                                    else {
                                        error('no results for locality');
                                    }
                                }
                            },
                            function () {
                                error('could not reverse geocode for locality');
                            }
                        ).
                        finally(function () {
                            $scope.$safeApply(function () {
                                $scope.location.resolving = false;
                            });
                        });
                },
                    function (err) {
                        $scope.$safeApply(function () {
                            $scope.locationError = err;
                        });
                        showGetLocationError(err);
                    }
                );

                promise.finally(function () {
                    $scope.$safeApply(function () {
                        $scope.refreshingLocation = false;
                    });
                });

                return promise;
            };


            var latestLocationSearchTextChangePromise;


            $scope.onLocationSearchTextChange = function (locationSearchText) {
                $log.log('onLocationSearchTextChange', locationSearchText);
                var thisPromise = geocoder.get(locationSearchText);
                latestLocationSearchTextChangePromise = thisPromise;
                $log.log('this vs latest', thisPromise, latestLocationSearchTextChangePromise);

                $scope.$safeApply(function () {
                    $scope.locationSearching = true;
                });

                thisPromise.
                then(function (result) {

                    // ignore all by latest responses
                    if (thisPromise !== latestLocationSearchTextChangePromise) {
                        return;
                    }

                    var locationResults = _.map(result.results, function (val) {
                        var location = locationConverter.convert(val);
                        return location;
                    });

                    $scope.$safeApply(function () {
                        $scope.locationSearching = false;
                        $scope.locationResults = locationResults;
                    });
                });
            };


            $scope.pickLocationResult = function (loc) {
                $log.log('picked location result', loc);

                $scope.locationResults = [];

                locations.save(loc).then(function (loc) {
                    $scope.locationError = null;
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


            var _scopingComputeCatsWithCatsAndForecast = function (cats, forecast, options) {
                conditionsEngine.computeCats(cats, forecast, options).
                then(function (result) {
                    $scope.$safeApply(function () {
                        $scope.pointSetsByCat = result;
                    });
                });
            };


            var _scopingComputeCatsWithCats = function (cats, loc, options) {
                var forecast = $scope.forecast;
                if (forecast) {
                    _scopingComputeCatsWithCatsAndForecast(cats, forecast, options);
                }
                else {
                    scopingGetForecastForLocation(loc).
                    then(function (forecast) {
                        _scopingComputeCatsWithCatsAndForecast(cats, forecast, options);
                    });
                }
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
                var deferred = $q.defer();
                var promise = deferred.promise;

                if (! (loc && loc.coords)) {
                    $log.warn('scopingGetForecastForLocation: no location');
                    deferred.reject('no location');
                    return promise;
                }

                var coords = loc.coords;

                $scope.$safeApply(function () {
                    $scope.refreshingForecast = true;
                });

                $log.log('scopingGetForecastForLocation: called with', arguments);
                forecastIo.get(coords, options).
                then(function (forecast) {
                    $log.log('forecast', forecast);

                    // transform
                    forecast.daily.last = forecast.daily.data[forecast.daily.data.length - 1];

                    var current = forecast.currently;

                    // $log.log('current result', result);
                    $scope.$safeApply(function () {
                        // set the controller-global variable
                        $scope.forecast = forecast;
                        // this should trigger 'current.time' watch, which re-compute cats
                        $scope.current = current;
                        deferred.resolve(forecast);
                    });
                }, function (err) {
                    $log.error('scopingGetForecastForLocation: error', err);
                    deferred.reject(err);
                }).
                finally(function () {
                    $scope.$safeApply(function () {
                        $scope.refreshingForecast = false;
                    });
                });
                return promise;
            };


            $scope.refreshForecast = function () {
                $log.log('refresh forecast', arguments);

                if ($scope.refreshingForecast) {
                    $log.log('already refreshing forecast');
                    return;
                }

                var loc = $scope.location;

                scopingGetForecastForLocation(loc, {
                    cache: false
                });
            };


            $scope.$watch('refreshingLocation || refreshingForecast', function () {
                $scope.$safeApply(function () {
                    $scope.refreshing = $scope.refreshingLocation || $scope.refreshingForecast;
                });
            });


            $scope.$watch('current.time', function () {
                $log.log('current.time change - re-computing cats', arguments);
                scopingComputeCats();
            });


            $scope.$watch('location', function (loc) {
                scopingGetForecastForLocation(loc);
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
    ];
});
