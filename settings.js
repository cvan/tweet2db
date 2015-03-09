'use strict';

module.exports = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: process.env.PORT || 5000,

  // Register your Twitter application here: https://apps.twitter.com/app/new
  TWITTER_CONSUMER_KEY: '',
  TWITTER_CONSUMER_SECRET: '',
  TWITTER_ACCESS_TOKEN: '',
  TWITTER_ACCESS_TOKEN_SECRET: ''
};


var settings_path = process.env.TWEET2DB_SETTINGS || './settings_local';

var settings_local;

if (settings_path[0] !== '/' && settings_path.substr(0, 2) !== './') {
  // Assume it's a relative path.
  settings_path = './' + settings_path;
}

try {
  settings_local = require(settings_path);
} catch (e) {
}

if (settings_local) {
  console.log('Using settings file ' + settings_path);
  Object.keys(settings_local).forEach(function (k) {
    module.exports[k] = settings_local[k];
  });
}
