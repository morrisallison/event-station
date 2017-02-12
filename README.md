# [![Event-Station][logo]][homepage]

[logo]: https://cldup.com/nNDX7LGO96.svg
[homepage]: https://github.com/morrisallison/event-station

A versatile and robust event emitter class.

[![npm Version][badge-npm]][npm]
[![Bower Version][badge-bower]][bower]
[![MIT License][badge-license]][license]
[![Travis CI Build Status][badge-travis]][travis]
[![Codecov Coverage Status][badge-codecov]][codecov]
[![Dependencies Status][badge-dependencies]][bithound]
[![DevDependencies Status][badge-dependencies-dev]][bithound]

[badge-bower]: https://img.shields.io/bower/v/event-station.svg?style=flat-square
[badge-codecov]: https://img.shields.io/codecov/c/github/morrisallison/event-station.svg?style=flat-square
[badge-dependencies-dev]: https://img.shields.io/bithound/devDependencies/github/morrisallison/event-station.svg?style=flat-square
[badge-dependencies]: https://img.shields.io/bithound/dependencies/github/morrisallison/event-station.svg?style=flat-square
[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[badge-npm]: https://img.shields.io/npm/v/event-station.svg?style=flat-square
[badge-travis]: https://img.shields.io/travis/morrisallison/event-station.svg?style=flat-square
[bithound]: https://bithound.io/github/morrisallison/event-station
[bower]: http://bower.io/search/?q=event-station
[codecov]: https://codecov.io/gh/morrisallison/event-station
[license]: https://github.com/morrisallison/event-station/raw/master/LICENSE
[npm]: https://www.npmjs.com/package/event-station
[travis]: https://travis-ci.org/morrisallison/event-station

## Features

* [Versatile API][] that's flexible and consistent
* [Cross-emitter listening][], allowing for easier management of many listeners
* [Regular expression listeners][]
* [Asynchronous Listeners][] with `emitAsync()`
* [Listener modifiers][]; a fluent interface for modifying listeners
    * Set callbacks and contexts with `calling()` and `using()`
    * Migration via `moveTo()`, `addTo()`, and `removeFrom()`
    * Remove listeners from *all* emitters with `off()`
    * Limit occurrences with `occur()`
    * `pause()`, `resume()`, and `isPaused()`
    * Create evented `race()` and `all()` promises
    * Duplication with `clone()`
* [Browser environment compatible][]
* [Competitive and consistent performance][]
* [Rx][] compatible with `toObservable()`
* Helpers like `stopPropagation()` and `listenerCount`
* `extend()` any object
* Global and per-instance `config()` options
* 230 tests with 100% code coverage
* Written in [TypeScript][]

[Versatile API]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md
[Cross-emitter listening]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#cross-emitter-listening
[Regular expression listeners]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#regular-expression-listeners
[Asynchronous Listeners]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#asynchronous-listeners
[Listener modifiers]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#listener-modifiers
[Browser environment compatible]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md#browser-usage
[Competitive and consistent performance]: https://github.com/morrisallison/event-station/blob/master/docs/Performance.md

[Rx]: https://www.npmjs.com/package/rx
[TypeScript]: https://github.com/Microsoft/TypeScript

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

Node.js via [Yarn](https://yarnpkg.com/)

```bash
yarn add event-station
```

Node.js via [npm](https://www.npmjs.com/)

```bash
npm install event-station --save
```

SystemJS via [jspm](http://jspm.io/)

```bash
jspm install npm:event-station
```

Web browser via [Bower](http://bower.io/)

```bash
bower install event-station
```

Web browser via `<script>`

```html
<script src="dist/event-station.min.js"></script>
<script>new EventStation();</script>
```

## Downloads

### Latest Release

* [ES5 Build][]
    - Compatible with AMD and CommonJS module loaders
    - Assigns an `EventStation` global when not imported as a module
* [ES6 Build][]
    - For use with an ES6 module loader
* [jsnext Build][]
    - ES5 compatible objects as an ES module. See the [Rollup Wiki][] for details.
* [ES5 Minified Build][]
    - ES5 Build minified with [UglifyJS 2][]
* [Source Map][]
    - The source map for the minified build
* [Definition][]
    - Generated TypeScript definition

[Definition]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.d.ts
[ES5 Build]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.js
[ES5 Minified Build]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.min.js
[ES6 Build]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.es6.js
[jsnext Build]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.jsnext.js
[Source Map]: https://github.com/morrisallison/event-station/raw/master/dist/event-station.min.js.map

[Rollup Wiki]: https://github.com/rollup/rollup/wiki/jsnext:main
[UglifyJS 2]: https://github.com/mishoo/UglifyJS2

## Documentation

* [Usage documentation][]
    - This guide will explain the general usage of Event-Station.
* [Module definition][]
    - The associated definition file can be used as an API reference.

[Usage documentation]: https://github.com/morrisallison/event-station/blob/master/docs/Usage.md
[Module definition]: https://github.com/morrisallison/event-station/blob/master/dist/event-station.d.ts

## License

Copyright &copy; 2016 [Morris Allison III](http://morris.xyz).
<br>Released under the [MIT license][license].

## References

Event-Station was influenced by [EventEmitter2][] and [Backbone.Events][].

[Backbone.Events]: http://backbonejs.org/#Events
[EventEmitter2]: https://github.com/asyncly/EventEmitter2
