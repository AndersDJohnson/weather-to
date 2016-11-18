var config = require('./.eslintrc.js');

config.plugins = config.plugins || [];
config.plugins.push('jasmine');

config.env = config.env || {};
config.env.jasmine = true;

module.exports = config;
