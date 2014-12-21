define(['angular'], function (angular) {

  var modalModule = angular.module('modal', []);


  modalModule.service('scopeModal', [
    '$modal', '$rootScope',
    function ($modal, $rootScope) {

      var scopeModal = function (templateId, scope, options) {

        options = options || {};
        scope = scope || {};

        var modalOptions = {
          templateUrl: 'templates/modal/' + templateId + '.html',
          controller: 'ModalInstanceCtrl'
        };

        console.log('scope types', scope.constructor, $rootScope.constructor);

        if (scope.constructor !== $rootScope.constructor) {
          var actualScope = $rootScope.$new();
          console.log('extending scopes', actualScope, scope);
          angular.extend(actualScope, scope);
          scope = actualScope;
        }

        console.log('modal scope', scope);
        modalOptions.scope = scope;

        var modalInstance = $modal.open(modalOptions);

        modalInstance.opened.then(function () {
          console.log('opened', this, arguments);
        });

        console.log('modal instance', modalInstance);

        return modalInstance;
      };

      return scopeModal;
    }
  ]);


  modalModule.controller('ModalInstanceCtrl',
    ['$scope', '$modalInstance',
    function ($scope, $modalInstance) {

      console.log('modal scope from ctrl', $scope);

      $scope.close = function (result) {
        $modalInstance.close(result);
      };

      $scope.dismiss = function (reason) {
        $modalInstance.dismiss(reason);
      };
    }
  ]);


  return modalModule;
});
