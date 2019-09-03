# NCU-Course-Finder

[![Maintainability](https://api.codeclimate.com/v1/badges/348be8f57877ddbbf86d/maintainability)](https://codeclimate.com/github/zetaraku/NCU-Course-Finder/maintainability)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fzetaraku%2FNCU-Course-Finder.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fzetaraku%2FNCU-Course-Finder?ref=badge_shield)
[![Greenkeeper badge](https://badges.greenkeeper.io/zetaraku/NCU-Course-Finder.svg)](https://greenkeeper.io/)

A rescue from the place where Nobody Care U.

Demo
----

[DEMO PAGE](https://ncucf.herokuapp.com/)

Introduction
------------

This is the v3.0 version of NCU-Course-Finder; old versions are no longer maintained.

All files are refactored and restructured, the front end now use **webpack**.

The front end of this project is written in JavaScript (ES7+), [Pug](https://pugjs.org/) (a.k.a. Jade), and SCSS.

I'm using [webpack](https://webpack.github.io/) as the module bundler of the front end.

Preparation
-----------

You must have installed [Node.js](https://nodejs.org/).

Then, use `npm install` in this directory to install all required dependencies.

Edit all the `*.example` files as you need and remove the `.example` suffix.

Developing
----------------

Use `npm run dev` to start the webpack-dev-server for development.

webpack-dev-server will watch your files and reload the page automatically.

Deploying
----------

When you're ready to serve the website,

use `npm run build` to generate the actual production files into `dist/`.

The bundler only generate two files: `index.html` and `bundle.js`.

Upload them and all files in `public/` together to your server to serve the page.

About the Course Data Source
-----------

The client need a backend server to fetch and update the database for the frontend periodically.

See [NCU-Course-Finder-DataFetcher](https://github.com/zetaraku/NCU-Course-Finder-DataFetcher).

License
-------

Copyright © 2017, Raku Zeta. Licensed under the MIT license.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fzetaraku%2FNCU-Course-Finder.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fzetaraku%2FNCU-Course-Finder?ref=badge_large)
