define([
    'angular',
    'lodash'
],
function (
  angular,
  _
) {

    var resourceArrayModule = angular.module('resourceArray', []);

    resourceArrayModule.provider('resourceArray', [function () {

        this.$get = [
            '$q', '$log',
            function ($q, $log) {

                var resourceArray = function (array, nextId) {

                    nextId = nextId || 1;

                    var resource = {};

                    resource.query = function () {
                        var deferred = $q.defer();
                        var promise = deferred.promise;

                        deferred.resolve(array);

                        return promise;
                    };


          /**
           * Remove by item or id.
           */
                    resource.remove = function (item) {
                        var deferred = $q.defer();
                        var promise = deferred.promise;

                        var id;

                        if (_.isPlainObject(item)) {
                            id = item.id;
                        }
                        else {
                            id = item;
                        }

                        if (! id) {
                            $log.error('must provide id');
                            deferred.reject('must provide id');
                            return promise;
                        }

                        var index = _.findIndex(array, {id: id});

            // remove it
                        array.splice(index, 1);

                        deferred.resolve(true);

                        return promise;
                    };


                    resource.save = function (data) {

                        var deferred = $q.defer();
                        var promise = deferred.promise;

                        if (! data) {
                            $log.error('must provide data');
                            deferred.reject('must provide data');
                            return promise;
                        }

            // clone data to prevent modification
                        data = _.cloneDeep(data);

                        $log.log('save', data);
                        var id = data.id;

                        var item;

                        if (id) {

                            item = _.findWhere(array, {id: id});
                            delete data.id;
                            _.extend(item, data);

                        }
                        else {

                            data.id = nextId++;
                            array.push(data);
                            item = data;

                        }

                        deferred.resolve(item);

                        return promise;
                    };
          
                    return resource;
                };

                return resourceArray;
            }];

    }]);

    return resourceArrayModule;
});
