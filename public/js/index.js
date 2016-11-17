require([
  'angular',
  'weatherTo'
], function (
  angular
) {

  angular.bootstrap(document, ['weatherTo'], {
    strictDi: true
  });

});
