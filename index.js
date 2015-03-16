'use strict';

var urllib = require('url');

var Boom = require('boom');
var Hapi = require('hapi');
var Twit = require('twit');
var redis = require('redis');

var settings = require('./settings');


if (process.env.REDISTOGO_URL) {
  var rtg = urllib.parse(process.env.REDISTOGO_URL);
  var redis = redis.createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(':')[1]);
} else {
  var redis = redis.createClient();
}


var internals = {
  node_env: process.env.NODE_ENVIRONMENT || 'development',
  T: new Twit({
    consumer_key: settings.TWITTER_CONSUMER_KEY,
    consumer_secret: settings.TWITTER_CONSUMER_SECRET,
    access_token: settings.TWITTER_ACCESS_TOKEN,
    access_token_secret: settings.TWITTER_ACCESS_TOKEN_SECRET
  }),
  server: new Hapi.Server()
};


function store(user, key, value, cb) {
  redis.set(user + ':' + key, value, function (err, reply) {
    if (cb) {
      cb(err, reply);
    }
  });
}


function retrieve(user, key, cb) {
  redis.get(user + ':' + key, function (err, reply) {
    if (cb) {
      cb(err, reply);
    }
  });
}


function remove(user, key, cb) {
  redis.del(user + ':' + key, function (err, reply) {
    if (cb) {
      cb(err, reply);
    }
  });
}


function parseTweet(str) {
  var splitOnEqual = str.split('=');

  var key = splitOnEqual[0].split(' ').map(function (chunk) {
    // Ignore any mentions.
    if (chunk[0] !== '@') {
      return chunk;
    }
  }).join(' ').replace(/^\s*/, '');

  splitOnEqual.shift();

  var value = splitOnEqual.join('=');

  return {
    key: key,
    value: value
  };
}


function isValidJSON(str) {
  // Lifted from https://github.com/douglascrockford/JSON-js/blob/master/json2.js
  return /^[\],:{}\s]*$/.test(str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
}


internals.server.connection({
  host: settings.HOST,
  port: settings.PORT,
  routes: {
    cors: settings.CORS,
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
});


function Record() {
}


Record.refresh = {
  handler: function (request, reply) {
    internals.T.get('statuses/mentions_timeline', function (err, data, response) {
      if (err) {
        console.error(err);
        return Boom.internal({error: err});
      }

      data.forEach(function (tweet) {
        var tweetParsed = parseTweet(tweet.text);
        store(tweet.user.screen_name, tweetParsed.key, tweetParsed.value);
      });

      reply({success: true});
    });
  }
};


Record.get = {
  handler: function (request, reply) {
    retrieve(request.params.user, request.params.key, function (err, data) {
      if (err) {
        console.error(err);
        return Boom.internal({error: err});
      }

      if (typeof data === 'undefined' || data === null) {
        return reply(Boom.notFound('does_not_exist'));
      }

      if (isValidJSON(data)) {
        reply(data).type('application/json');
      } else {
        reply(data).type('text/plain');
      }
    });
  }
};


Record.remove = {
  handler: function (request, reply) {
    retrieve(request.params.user, request.params.key, function (err, data) {
      if (typeof data === 'undefined' || data === null) {
        return reply(Boom.notFound('does_not_exist'));
      }

      remove(request.params.user, request.params.key, function (err, data) {
        if (err) {
          console.error(err);
          return Boom.internal({error: err});
        }

        reply({success: true});
      });
    });
  }
};


internals.server.route([
  {method: 'GET', path: '/refresh', config: Record.refresh},
  {method: 'GET', path: '/data/{user}/{key}', config: Record.get},
  {method: 'DELETE', path: '/data/{user}/{key}', config: Record.remove}
]);


// Do not start the server when this script is required by another script.
if (!module.parent) {
  internals.server.start(function () {
    console.log('[%s] Listening on %s', internals.node_env,
                internals.server.info.uri);
  });
}


module.exports = internals.server;
