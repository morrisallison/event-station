# [![Event-Station](https://cldup.com/nNDX7LGO96.svg)](http://morrisallison.bitbucket.org/event-station)

A versatile and robust event emitter class.

[![npm Version](https://img.shields.io/npm/v/event-station.svg?style=flat-square)](https://www.npmjs.com/package/event-station)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://bitbucket.org/morrisallison/event-station/raw/default/LICENSE)
[![Codeship Build Status](https://img.shields.io/codeship/4ade98f0-4121-0133-db1d-62bb193b9897.svg?style=flat-square)](https://codeship.com/projects/103550)
[![Codecov Coverage Status](https://img.shields.io/codecov/c/bitbucket/morrisallison/event-station/default.svg?style=flat-square)](https://codecov.io/bitbucket/morrisallison/event-station/commits)
[![Dependencies Status](https://img.shields.io/badge/dependencies-none-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/event-station)

## Features

* [Versatile API](http://morrisallison.bitbucket.org/event-station/api/) that's flexible and consistent
* [Cross-emitter listening](http://morrisallison.bitbucket.org/event-station/usage.html#cross-emitter-listening), allowing for easier management of many listeners
* [Regular expression listeners](http://morrisallison.bitbucket.org/event-station/usage.html#regular-expression-listeners) <sup>(optional)</sup>
* [Listener modifiers](http://morrisallison.bitbucket.org/event-station/usage.html#listener-modifiers); a fluent interface for modifying listeners
    * Set callbacks and contexts
    * Move between stations
    * Occurrence limitation
    * Pause and resume
    * Promises <sup>(optional)</sup>
* Browser environment compatible
* [Competitive and consistent performance](http://morrisallison.bitbucket.org/event-station/performance.html)

## Examples

### Using cross-emitter listening with a given context

```javascript
var student = new EventStation();
var teacher = new EventStation();

var book = "Harry Potter";

student.hear(teacher, 'read', function (pageNumber) {
    console.log('Today the class is reading ' + this + ' on page ' + pageNumber + '.');
}, book);

// Logs: "Today the class is reading Harry Potter on page 42."
teacher.emit('read', 42);
```
### Using a listener map and the `addTo()` modifier

```javascript
var worker = new EventStation();
var secondWorker = new EventStation();

var listeners = worker.on({
    start: () => console.log("Worker started!"),
    stop:  () => console.log("Worker stopped!"),
});

// The same listeners are now attached to both instances
listeners.addTo(secondWorker);
```

### Chaining listener modifiers

```javascript
new EventStation()
    // Create two listeners
    .on('boom pow')
    // That can occur only twice
    .occur(2)
    // That use the given context
    .using(context)
    // That use the given callback
    .calling(function () {})
    // Make a `Promise` that resolves after one of the listeners is called
    .race()
    .then(function () {
        console.log('Either "boom" or "pow" was emitted.');
    });
```

## Installation

Node.js via [npm](https://www.npmjs.com/package/event-station)

```bash
$ npm install event-station
```

SystemJS via [jspm](http://jspm.io/)

```bash
$ jspm install npm:event-station
```

## Usage

For documentation on the general usage of Event-Station, please view the [usage documentation](http://morrisallison.bitbucket.org/event-station/usage/).

## API

The [API documentation](http://morrisallison.bitbucket.org/event-station/api/) is generated using [typedoc](http://typedoc.io/).

The associated [module definition](https://bitbucket.org/morrisallison/event-station/src/default/dist/event-station.d.ts) can also be used as an API reference.

## License

Copyright &copy; 2015 Morris Allison III. Released under the [MIT License](https://bitbucket.org/morrisallison/event-station/raw/default/LICENSE).

## References

Event-Station was influenced by [EventEmitter2](https://github.com/asyncly/EventEmitter2) and [Backbone.Events](http://backbonejs.org/#Events).