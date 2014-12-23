define(['angular', 'lodash'], function (angular, _) {

  var modalModule = angular.module('modal', []);


  modalModule.service('scopeModal', [
    '$log', '$modal', '$rootScope',
    function ($log, $modal, $rootScope) {

      var defaultOptions = {
        autofocus: true
      };

      var scopeModal = function (templateId, scope, options) {

        options = _.defaults({}, options, defaultOptions);

        scope = scope || {};

        var modalOptions = {
          templateUrl: 'templates/modals/' + templateId + '.html',
          controller: 'ModalInstanceController'
        };

        $log.log('scope types', scope.constructor, $rootScope.constructor);

        if (scope.constructor !== $rootScope.constructor) {
          var actualScope = $rootScope.$new();
          $log.log('extending scopes', actualScope, scope);
          angular.extend(actualScope, scope);
          scope = actualScope;
        }

        $log.log('modal scope', scope);
        modalOptions.scope = scope;

        var modalInstance = $modal.open(modalOptions);

        modalInstance.opened.then(function () {
          $log.log('opened', this, arguments);

          $log.log('options.autofocus', options.autofocus);

          if (options.autofocus) {
            var $modalEl = angular.element('[modal-window]').last();
            $log.log('$modalEl', $modalEl, 'index', $modalEl.attr('index'));
            // var $input = $el.find('input[autofocus]').first();
            var $autofocusEl = $modalEl.find('[autofocus]').first();
            $autofocusEl.focus();
          }
        });

        $log.log('modal instance', modalInstance);

        return modalInstance;
      };

      return scopeModal;
    }
  ]);


  modalModule.controller('ModalInstanceController',
    ['$log', '$scope', '$modalInstance',
    function ($log, $scope, $modalInstance) {

      $log.log('modal scope from ctrl', $scope);

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
