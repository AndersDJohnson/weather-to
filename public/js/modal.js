define(['angular'], function (angular) {

  var modalModule = angular.module('modal', []);


  modalModule.service('scopeModal', ['$modal', function ($modal) {

    var scopeModal = function (templateId, data) {

      var modalInstance = $modal.open({
        templateUrl: 'templates/modal-' + templateId + '.html',
        controller: 'ModalInstanceCtrl',
        resolve: {
          data: function () {
            return data;
          }
        }
      });

      return modalInstance;
    };

    return scopeModal;
  }]);


  modalModule.controller('ModalInstanceCtrl',
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


  return modalModule;
});
