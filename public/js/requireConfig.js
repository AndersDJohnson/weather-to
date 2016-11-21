require.config({
  baseUrl: 'js',
  paths: {
    angular: '../bower_components/angular/angular',
    'angular-messages': '../bower_components/angular-messages/angular-messages',
    'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'angular-moment': '../bower_components/angular-moment/angular-moment',
    'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
    'angular-aria': '../bower_components/angular-aria/angular-aria',
    'AngularJS-Scope.SafeApply': '../bower_components/AngularJS-Scope.SafeApply/src/Scope.SafeApply',
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
    jquery: '../bower_components/jquery/dist/jquery',
    lodash: '../bower_components/lodash/dist/lodash.compat',
    moment: '../bower_components/moment/moment',
    requirejs: '../bower_components/requirejs/require',
    async: '../bower_components/requirejs-plugins/src/async',
    depend: '../bower_components/requirejs-plugins/src/depend',
    font: '../bower_components/requirejs-plugins/src/font',
    goog: '../bower_components/requirejs-plugins/src/goog',
    image: '../bower_components/requirejs-plugins/src/image',
    json: '../bower_components/requirejs-plugins/src/json',
    mdown: '../bower_components/requirejs-plugins/src/mdown',
    noext: '../bower_components/requirejs-plugins/src/noext',
    propertyParser: '../bower_components/requirejs-plugins/src/propertyParser',
    'Markdown.Converter': '../bower_components/requirejs-plugins/lib/Markdown.Converter',
    text: '../bower_components/requirejs-plugins/lib/text',
    'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
    'angular-animate': '../bower_components/angular-animate/angular-animate',
    'angular-local-storage': '../bower_components/angular-local-storage/dist/angular-local-storage'
  },
  shim: {
    bootstrap: {
      deps: [
        'jquery'
      ]
    },
    angular: {
      exports: 'angular',
      deps: [
        'jquery'
      ]
    },
    'angular-animate': {
      deps: [
        'angular'
      ]
    },
    'angular-local-storage': {
      deps: [
        'angular'
      ]
    },
    'angular-messages': {
      deps: [
        'angular'
      ]
    },
    'angular-bootstrap': {
      deps: [
        'angular'
      ]
    },
    'angular-moment': {
      deps: [
        'angular'
      ]
    },
    'angular-ui-router': {
      deps: [
        'angular'
      ]
    },
    'angular-aria': {
      deps: [
        'angular'
      ]
    },
    'AngularJS-Scope.SafeApply': {
      deps: [
        'angular'
      ]
    }
  },
  packages: [

  ]
});
