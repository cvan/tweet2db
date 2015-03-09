'use strict';

var http = require('http');

var Twit = require('twit');

var settings = require('./settings');


var internals = {
  node_env: process.env.NODE_ENVIRONMENT || 'development',
  host: settings.HOST,
  port: settings.PORT,
  T: new Twit({
    consumer_key: settings.TWITTER_CONSUMER_KEY,
    consumer_secret: settings.TWITTER_CONSUMER_SECRET,
    access_token: settings.TWITTER_ACCESS_TOKEN,
    access_token_secret: settings.TWITTER_ACCESS_TOKEN_SECRET
  })
};


var server = http.createServer(function (req, res) {
  res.writeHead(200);
  res.end();
});


server.listen(internals.port, internals.host, function () {
  console.log('[%s] Server listening on http://%s:%s',
    internals.node_env, internals.host, internals.port);
});


module.exports = server;
