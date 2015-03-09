# tweet2db

A bot that accepts data from a tweet and saves it in a key-value store.


## Sample Usage

Tweet at [@tweet2db](https://twitter.com/tweet2db), like so:

    @tweet2db yolo='themotto'

Make sure the database is refreshed. To force a refresh, you can hit this URL:

[__https://tweet2db.herokuapp.com/refresh__](http://tweet2db.herokuapp.com/refresh)

Then get the data by hitting the URL directly:

[__https://tweet2db.herokuapp.com/data/`<your_twitter_username>`/yolo__](http://tweet2db.herokuapp.com/data/<your_twitter_username>/yolo)

Or via XHR from a web page:

```js
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://tweet2db.herokuapp.com/data/<your_twitter_username>/yolo', true);
xhr.onload = function () {
  console.log(xhr.responseText);
};
xhr.onerror = function (e) {
  console.error('XHR error: ' + e.error);
};
xhr.send();
```


## Installation

1. Install the Node dependencies:

        npm install

2. Generate a local settings file:

        cp settings_local.js{.dist,}

3. Install Redis:

        brew install redis

4. Set up Redis:

        brew info redis


## Development

Serve the site from the simple server:

    npm run dev

Then launch the site from your favourite browser:

[__http://localhost:3000/__](http://localhost:3000/)

If you wish to serve the site from a different port:

    TWEET2DB_PORT=8000 npm run dev


## Deployment

In production, the server is run like so:

    NODE_ENVIRONMENT=production node index.js

Alternatively:

    npm run prod

To run the server à la Heroku:

    foreman start web
