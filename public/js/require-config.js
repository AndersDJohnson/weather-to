require.config({
  baseUrl: "js",
  paths: {
    angular: "../bower_components/angular/angular",
    "angular-bootstrap": "../bower_components/angular-bootstrap/ui-bootstrap-tpls",
    "angular-moment": "../bower_components/angular-moment/angular-moment",
    "angular-ui-router": "../bower_components/angular-ui-router/release/angular-ui-router",
    bootstrap: "../bower_components/bootstrap/dist/js/bootstrap",
    jquery: "../bower_components/jquery/dist/jquery",
    lodash: "../bower_components/lodash/dist/lodash.compat",
    moment: "../bower_components/moment/moment",
    requirejs: "../bower_components/requirejs/require",
    "AngularJS-Scope.SafeApply": "../bower_components/AngularJS-Scope.SafeApply/src/Scope.SafeApply"
  },
  shim: {
    angular: {
      exports: "angular"
    },
    "angular-bootstrap": {
      deps: [
        "angular"
      ]
    },
    "AngularJS-Scope.SafeApply": {
      deps: [
        "angular"
      ]
    }
  },
  packages: [

  ]
});
