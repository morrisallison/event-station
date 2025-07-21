# [![Event-Station][logo]][homepage]

[logo]: https://cldup.com/nNDX7LGO96.svg
[homepage]: https://github.com/morrisallison/event-station

> A versatile and robust event emitter class.

[![npm Version][badge-npm]][npm]
[![MIT License][badge-license]][license]

[badge-license]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[badge-npm]: https://img.shields.io/npm/v/event-station.svg?style=flat-square
[license]: https://github.com/morrisallison/event-station/raw/main/LICENSE
[npm]: https://www.npmjs.com/package/event-station

## Features

- [Versatile API][] that's flexible and consistent
- [Cross-emitter listening][], allowing for easier management of many listeners
- [Regular expression listeners][]
- [Asynchronous Listeners][] with `emitAsync()`
- [Listener modifiers][]; a fluent interface for modifying listeners
  - Set callbacks and contexts with `calling()` and `using()`
  - Migration via `moveTo()`, `addTo()`, and `removeFrom()`
  - Remove listeners from _all_ emitters with `off()`
  - Limit occurrences with `occur()`
  - `pause()`, `resume()`, and `isPaused()`
  - Create evented `race()` and `all()` promises
  - Duplication with `clone()`
- [Browser environment compatible][]
- [Competitive and consistent performance][]
- Helpers like `stopPropagation()` and `listenerCount`
- `extend()` any object
- Global and per-instance `config()` options
- 100% code coverage
- Written in [TypeScript][]

[Versatile API]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md
[Cross-emitter listening]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#cross-emitter-listening
[Regular expression listeners]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#regular-expression-listeners
[Asynchronous Listeners]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#asynchronous-listeners
[Listener modifiers]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#listener-modifiers
[Browser environment compatible]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md#browser-usage
[Competitive and consistent performance]: https://github.com/morrisallison/event-station/blob/main/docs/Performance.md
[Rx]: https://www.npmjs.com/package/rx
[TypeScript]: https://github.com/Microsoft/TypeScript

## Example

```javascript
import { EventStation } from "event-station";

class Spaceship extends EventStation {
  launch(destination) {
    this.emit("launch", destination);
  }
}

let Normandy = new Spaceship();
let Tempest = new Spaceship();

// Add two listeners via a listener map
let listeners = Normandy.on({
  launch: (dest) => console.log(`Spaceship launched! En route to ${dest}.`),
  dock: () => console.log("Spaceship docking."),
});

// Attach the same listeners to Tempest that are on Normandy
listeners.addTo(Tempest);

// Launch Tempest when Normandy launches
Tempest.hear(Normandy, "launch").once((dest) => Tempest.launch(dest));

// Launch both ships to the Andromeda Galaxy
Normandy.launch("Messier 31");

// Stop listening to both ships
listeners.off();
```

[View more usage examples.](https://github.com/morrisallison/event-station/blob/main/docs/Examples.md)

## Installation

Via [npm](https://www.npmjs.com/)

```bash
npm install event-station
```

## Downloads

### Latest Release

- [ESM build][] — Imported as an ES module.
- [ESM minified build][] — Minified ES module.
- [Source map][] — Source map for the minified build
- [Definition][] — Rolled-up TypeScript definition

[Definition]: https://github.com/morrisallison/event-station/raw/main/dist/event-station.d.ts
[ESM Build]: https://github.com/morrisallison/event-station/raw/main/dist/event-station.js
[ESM Minified Build]: https://github.com/morrisallison/event-station/raw/main/dist/event-station.min.js
[Source Map]: https://github.com/morrisallison/event-station/raw/main/dist/event-station.min.js.map

## Documentation

- [Usage documentation][] — This guide will explain the general usage of Event-Station.
- [Module definition][] — The associated definition file can be used as an API reference.

[Usage documentation]: https://github.com/morrisallison/event-station/blob/main/docs/Usage.md
[Module definition]: https://github.com/morrisallison/event-station/blob/main/dist/event-station.d.ts

## License

Copyright &copy; 2015-2025 [Morris Allison III](http://morris.xyz).
<br>Released under the [MIT license][license].

## References

Event-Station was inspired by [EventEmitter2][] and [Backbone.Events][].

[Backbone.Events]: http://backbonejs.org/#Events
[EventEmitter2]: https://github.com/asyncly/EventEmitter2
