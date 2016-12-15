# [![Event-Station](https://cldup.com/nNDX7LGO96.svg)](https://github.com/morrisallison/event-station)

A versatile and robust event emitter class.

[![npm Version](https://img.shields.io/npm/v/event-station.svg?style=flat-square)](https://www.npmjs.com/package/event-station)
[![Bower Version](https://img.shields.io/bower/v/event-station.svg?style=flat-square)](http://bower.io/search/?q=event-station)
[![MIT/Expat License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/morrisallison/event-station/raw/master/LICENSE)
[![Travis CI Build Status](https://img.shields.io/travis/morrisallison/event-station.svg?style=flat-square)](https://travis-ci.org/morrisallison/event-station)
[![Codecov Coverage Status](https://img.shields.io/codecov/c/github/morrisallison/event-station.svg?style=flat-square)](https://codecov.io/gh/morrisallison/event-station)
[![Dependencies Status](https://img.shields.io/badge/dependencies-none-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/event-station)

## Features

* [Versatile API](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md) that's flexible and consistent
* [Cross-emitter listening](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#cross-emitter-listening), allowing for easier management of many listeners
* [Regular expression listeners](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#regular-expression-listeners)
* [Asynchronous Listeners](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#asynchronous-listeners) with `emitAsync()`
* [Listener modifiers](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#listener-modifiers); a fluent interface for modifying listeners
    * Set callbacks and contexts with `calling()` and `using()`
    * Migration via `moveTo()`, `addTo()`, and `removeFrom()`
    * Remove listeners from *all* emitters with `off()`
    * Limit occurrences with `occur()`
    * `pause()`, `resume()`, and `isPaused()`
    * Create evented `race()` and `all()` promises
    * Duplication with `clone()`
* [Browser environment compatible](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#browser-usage)
* [Competitive and consistent performance](https://github.com/morrisallison/event-station/blob/master/docs/Performance.md)
* [Rx](https://www.npmjs.com/package/rx) compatible with `toObservable()`
* Helpers like `stopPropagation()` and `listenerCount`
* `extend()` any object
* Global and per-instance `config()` options
* 230 tests with 100% code coverage
* Written in [TypeScript](http://www.typescriptlang.org/)

## Example

```javascript
import EventStation from 'event-station';

class Spaceship extends EventStation {
    launch(destination) {
        this.emit('launch', destination);
    }
}

let Normandy = new Spaceship();
let Tempest = new Spaceship();

// Add two listeners via a listener map
let listeners = Normandy.on({
    launch: (dest) => console.log(`Spaceship launched! En route to ${dest}.`),
    dock: () => console.log('Spaceship docking.'),
});

// Attach the same listeners to Tempest that are on Normandy
listeners.addTo(Tempest);

// Launch Tempest when Normandy launches
Tempest.hear(Normandy, 'launch')
    .once((dest) => Tempest.launch(dest));

// Launch both ships to the Andromeda Galaxy
Normandy.launch('Messier 31');

// Stop listening to both ships
listeners.off();
```

[View more usage examples.](https://github.com/morrisallison/event-station/blob/master/docs/Examples.md)

## Installation

Node.js via [npm](https://www.npmjs.com/package/event-station)

```bash
$ npm install event-station
```

SystemJS via [jspm](http://jspm.io/)

```bash
$ jspm install npm:event-station
```

Web browser via [Bower](http://bower.io/search/?q=event-station)

```bash
$ bower install event-station
```

Web browser via `<script>`

```html
<script src="dist/event-station.min.js"></script>
<script>new EventStation();</script>
```

## Downloads

### Latest Release

* [ES5 Build](https://github.com/morrisallison/event-station/raw/master/dist/event-station.js)
    - Compatible with AMD and CommonJS module loaders
    - Assigns an `EventStation` global when not imported as a module
* [ES6 Build](https://github.com/morrisallison/event-station/raw/master/dist/event-station.es6.js)
    - For use with an ES6 module loader
* [jsnext Build](https://github.com/morrisallison/event-station/raw/master/dist/event-station.jsnext.js)
    - ES5 compatible objects as an ES module. See the [Rollup Wiki](https://github.com/rollup/rollup/wiki/jsnext:main) for details.
* [ES5 Minified Build](https://github.com/morrisallison/event-station/raw/master/dist/event-station.min.js)
    - ES5 Build minified with [UglifyJS 2](https://github.com/mishoo/UglifyJS2)
* [Source Map](https://github.com/morrisallison/event-station/raw/master/dist/event-station.min.js.map)
    - The source map for the minified build
* [Definition](https://github.com/morrisallison/event-station/raw/master/dist/event-station.d.ts)
    - Generated TypeScript definition

## Documentation

* [Usage documentation](https://github.com/morrisallison/event-station/blob/master/docs/Usage.md)
    - This guide will explain the general usage of Event-Station.
* [Module definition](https://github.com/morrisallison/event-station/blob/master/dist/event-station.d.ts)
    - The associated definition file can be used as an API reference.

## License

Copyright &copy; 2016 [Morris Allison III](http://morris.xyz).
<br>Released under the [MIT/Expat license](https://github.com/morrisallison/event-station/raw/master/LICENSE).

## References

Event-Station was influenced by [EventEmitter2](https://github.com/asyncly/EventEmitter2) and [Backbone.Events](http://backbonejs.org/#Events).
