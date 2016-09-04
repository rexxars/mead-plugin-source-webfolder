# mead-plugin-source-webfolder

[![npm version](http://img.shields.io/npm/v/mead-plugin-source-webfolder.svg?style=flat-square)](http://browsenpm.org/package/mead-plugin-source-webfolder)[![Build Status](http://img.shields.io/travis/rexxars/mead-plugin-source-webfolder/master.svg?style=flat-square)](https://travis-ci.org/rexxars/mead-plugin-source-webfolder)[![Coverage Status](https://img.shields.io/coveralls/rexxars/mead-plugin-source-webfolder/master.svg?style=flat-square)](https://coveralls.io/github/rexxars/mead-plugin-source-webfolder)[![Dependency status](https://img.shields.io/david/rexxars/mead-plugin-source-webfolder.svg?style=flat-square)](https://david-dm.org/rexxars/mead-plugin-source-webfolder)

Web folder source for the Mead image transformer service - loads images from a path on a remote HTTP(s) server.

## Installation

```shell
# Bundled with mead by default, but if you're feeling frisky
npm install --save mead-plugin-source-webfolder
```

## Usage

**Note: Bundled with Mead and enabled by default**

Your mead configuration file (`mead --config <path-to-config.js>`):

```js
module.exports = {
  // Load the plugin
  plugins: [
    require('mead-plugin-source-webfolder')
  ],

  // Define a source using the webfolder proxy
  sources: [{
    name: 'my-webfolder-source',
    adapter: {
      type: 'webfolder',
      config: {
        // All URLs will be relative to this
        baseUrl: 'http://mead.science/images',

        // Optional timeout in milliseconds before giving up the request (default: 7500)
        timeout: 3500
      }
    }
  }]
}
```

## License

MIT-licensed. See LICENSE.
