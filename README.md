# tweet2db

A bot that takes a tweet and saves it in a key-value store.


## Installation

1. Install the Node dependencies:

	    npm install

2. Generate a local settings file:

		cp settings_local.js{.dist,}


## Development

Serve the site from the simple server:

    npm run dev

Then launch the site from your favourite browser:

[__http://localhost:3000/__](http://localhost:3000/)

If you wish to serve the site from a different port:

    MOZ_GDC_PORT=8000 npm run dev


## Deployment

In production, the server is run like so:

    NODE_ENVIRONMENT=production node index.js

Alternatively:

    npm run prod

To run the server à la Heroku:

    foreman start web
