var config = require('./.eslintrc.js');

config.plugins = config.plugins || [];
config.plugins.push('jasmine');
config.plugins.push('protractor');

config.env = config.env || {};
config.env.jasmine = true;
config.env.protractor = true;

module.exports = config;
