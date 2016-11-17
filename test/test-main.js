var allTestFiles = []
var TEST_REGEXP = /(spec|test)\.js$/i

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/$/g, '../../')
    normalizedTestModule = file.replace(/^\.js$/g, '')
    allTestFiles.push(normalizedTestModule)
  }
})

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  // baseUrl: '/base',
  baseUrl: '/base/public/js',

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start,

  paths: {
    angular: "../bower_components/angular/angular",
    'angular-mocks': "../bower_components/angular-mocks/angular-mocks",
    "angular-messages": "../bower_components/angular-messages/angular-messages",
    "angular-bootstrap": "../bower_components/angular-bootstrap/ui-bootstrap-tpls",
    "angular-moment": "../bower_components/angular-moment/angular-moment",
    "angular-ui-router": "../bower_components/angular-ui-router/release/angular-ui-router",
    "angular-aria": "../bower_components/angular-aria/angular-aria",
    "AngularJS-Scope.SafeApply": "../bower_components/AngularJS-Scope.SafeApply/src/Scope.SafeApply",
    bootstrap: "../bower_components/bootstrap/dist/js/bootstrap",
    jquery: "../bower_components/jquery/dist/jquery",
    lodash: "../bower_components/lodash/dist/lodash.compat",
    moment: "../bower_components/moment/moment",
    requirejs: "../bower_components/requirejs/require",
    async: "../bower_components/requirejs-plugins/src/async",
    depend: "../bower_components/requirejs-plugins/src/depend",
    font: "../bower_components/requirejs-plugins/src/font",
    goog: "../bower_components/requirejs-plugins/src/goog",
    image: "../bower_components/requirejs-plugins/src/image",
    json: "../bower_components/requirejs-plugins/src/json",
    mdown: "../bower_components/requirejs-plugins/src/mdown",
    noext: "../bower_components/requirejs-plugins/src/noext",
    propertyParser: "../bower_components/requirejs-plugins/src/propertyParser",
    "Markdown.Converter": "../bower_components/requirejs-plugins/lib/Markdown.Converter",
    text: "../bower_components/requirejs-plugins/lib/text"
  },
  shim: {
    bootstrap: {
      deps: [
        "jquery"
      ]
    },
    angular: {
      exports: "angular",
      deps: [
        "jquery"
      ]
    },
    "angular-mocks": {
      deps: [
        "angular"
      ]
    },
    "angular-messages": {
      deps: [
        "angular"
      ]
    },
    "angular-bootstrap": {
      deps: [
        "angular"
      ]
    },
    "angular-moment": {
      deps: [
        "angular"
      ]
    },
    "angular-ui-router": {
      deps: [
        "angular"
      ]
    },
    "angular-aria": {
      deps: [
        "angular"
      ]
    },
    "AngularJS-Scope.SafeApply": {
      deps: [
        "angular"
      ]
    }
  }
});
