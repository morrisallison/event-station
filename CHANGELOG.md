# Changelog

### v1.0.0-beta

* Add `emitAsync()`.
    * Works just like `emit()`, except it returns a `Promise` that resolves when all of the called listeners have completed.
    * Asynchronous listeners must return a Promise-like object.
    * Please view the documentation for [asynchronous listeners](http://morrisallison.bitbucket.org/event-station/usage.html#asynchronous-listeners) for more details.

### v0.5.2

* Added listener modifiers
    1. `attach()`
    2. `detach()`
* Improved listener removal performance.
* If `Listeners.prototype.isAttachedTo()` is applied with no parameters, it now determines whether *any* of the listeners are attached to *any* station.
* Changed `Listeners.prototype.clone()` to set an origin station on the created `Listeners` instance.

### v0.5.1

* Distributed modules now assign an `EventStation` global when not imported as a module.
    * Allows Event-Station to be used in Web browsers via a `<script>` tag.
* Added members
    1. `EventStation.prototype.getListeners()`
    3. `Listeners.prototype.count`
    2. `Listeners.prototype.has()`
    4. `Listeners.prototype.clone()`
* Added package to [Bower](http://bower.io).

### v0.5.0

#### Breaking Changes

* Changed the `off()` listener modifier to remove listeners from ***ALL*** stations.
    * Before `0.5.0` the `off()` listener modifier removed listeners from only the origin station.
    * The `removeFrom()` listener modifier can be used instead to remove listeners from one station.
    * Initially, this was the expected behavior.
* Renamed `heardCount` to `hearingCount` for clarity.

#### Non-breaking Changes

* Added listener modifiers
    1. `forEach()`
    2. `index()`
    3. `get()`
* The `race()` and `all()` listener modifiers no longer override each listener's callback.
    * Using `calling()` after using either `race()` and `all()` no longer breaks promises.
* Added `EventStation.prototype.toObservable()` for creating Rx Observables
* Added `EventStation.inject()` for injecting the `rx` namespace and `Promise`-like objects
    * See the [API documentation](http://morrisallison.bitbucket.org/event-station/api/) for details.

### v0.4.1

* Added the `reset()` listener modifier
* Added the `enableDelimiter` option
    * Performance gains of 25% have been seen when this option is set to `false`.
* General performance improvements

### v0.4.0

* [New website](http://morrisallison.bitbucket.org/event-station)
* Added `stopPropagation()`
* Callbacks are now optional for event name strings and event name arrays.
    * `station.on('boom').calling(function () {});`

### v0.3.0

#### Breaking Changes

* Renamed the listener modifier `thenCall()` to `calling()`
    1. For consistency with the `using()` modifier
    2. For clarity; to not confuse with `Function.prototype.call()` and `Promise.prototype.then()`

#### Non-breaking Changes

* Added listener modifiers
    1. `pause()`
    2. `resume()`
    3. `isPaused()`
* Added regular expression listeners
* Added options
    * enableRegExp
    * regExpMarker
* 100% code coverage

### v0.2.1

* Added listener modifiers
    1. `isAttached()`
    2. `isAttachedTo()`

### v0.2.0

#### Breaking Changes

* EventStation now uses a `constructor`
    * Direct prototypal inheritance and how literal objects are extended has changed
        * Please view [USAGE.md](https://bitbucket.org/morrisallison/event-station/src/default/USAGE.md) to see how to do this in v0.2.0.
    * More advanced forms of inheritance remain unchanged, e.g. TypeScript and CoffeeScript

#### Non-breaking Changes

* Added listener modifiers
    1. `off()`
    2. `using()`
    3. `addTo()`
    4. `removeFrom()`
    5. `moveTo()`
* Added the `delimiter` option
* Options can be now be set using the `EventStation()` constructor
* Performance improvements
* Added benchmarks

### v0.1.2

* Added listener modifiers
    1. `occur()`
    2. `thenCall()`
    3. `once()`
* Added the `emitAllEvent` option
* Fixed `heardCount`
* To reduce possible method name conflicts, private methods are now prefixed with an underscore.

### v0.1.1

* Initial release