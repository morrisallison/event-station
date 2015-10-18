# Usage

This guide will explain general usage of Event-Station.

Usage examples can be found in [Event-Station's tests](https://bitbucket.org/morrisallison/event-station/src/default/tests/). Tests are written in [CoffeeScript](http://coffeescript.org/).

## Table of Contents

* [Terminology](#terminology)
* [Installation](#installation)
* [Configuration](#configuration)
    * [Options](#options)
* [Listeners](#listeners)
    1. [Single Event String](#single-event-name)
    2. [Delimited Event Strings](#delimited-event-names)
    3. [Event String Array](#event-name-array)
    4. [Listener Map](#listener-map)
* [Adding Listeners](#adding-listeners)
* [Removing Listeners](#removing-listeners)
* [Emitting Events](#emitting-events)
* [Providing Context](#providing-context)
* [Cross-emitter Listening](#cross-emitter-listening)
* [Limiting Occurrences](#limiting-occurrences)
* [Regular Expression Listeners](#regular-expression-listeners)
* [Listener Modifiers](#listener-modifiers)
* [Browser Usage](#browser-usage)
* [Object Inheritance](#object-inheritance)
    * [ES6 & TypeScript](#es6-typescript)
    * [CoffeeScript](#coffeescript)
    * [JavaScript (ES5)](#javascript-es5)
    * [Object Literal](#object-literal)

## Terminology

* `EventStation` instances are referred to as a "station."
* `student` and `teacher` are used as examples of `EventStation` instances.

## Installation

Node.js via [npm](https://www.npmjs.com/package/event-station)

```bash
$ npm install event-station
```

SystemJS via [jspm](http://jspm.io/)

```bash
$ jspm install npm:event-station
```

See the [Browser Usage](#browser-usage) section for how to use Event-Station within Web browsers.

## Configuration

Event-Station can be configured globally using:

```
EventStation.config(options);
```

`EventStation` instances can configured during initialization by providing a literal object with options:

```
new EventStation(options);
```

Other objects can be configured and initialized by using:

```
EventStation.init(obj, options);
```

### Options

#### emitAllEvent `boolean`

Determines whether a station emits an `"all"` event for every event that is emitted.
<br>&emsp;&emsp;`true` by default.

#### enableRegExp `boolean`

Determines whether a station can use regular expression listeners.
<br>&emsp;&emsp;`false` by default.

#### regExpMarker `string`

The character used to mark regular expression listeners.
<br>&emsp;&emsp;`"%"` by default.

#### enableDelimiter `boolean`

Determines whether a station can use delimited event names.
<br>&emsp;&emsp;`true` by default.

#### delimiter `string`

The character used to delimit event names in a string.
<br>&emsp;&emsp;`" "` (space) by default.

## Listeners

Each listener is an object with its own state. As a result, listeners can maintain their state while being paused or detached from stations.

Methods on the `EventStation` class share the same basic interface, which accepts:

* A `string` with a single event name
* A `string` with delimited event names
* An event name array containing event name strings
* An listener map with event names as keys and callbacks as properties

### Single Event Name

A single event name can be given to create one listener for one event name.

```javascript
var listeners = student.on('wakeup', function () {
    console.error("No, five more minutes, please.")
});
```

### Delimited Event Names

Delimited event names can be given to create *multiple* listeners with the same callback and/or context.

By default, event names are delimited by spaces. This can be changed by setting the `delimiter` option.

```javascript
var listeners = student.on('eating-breakfast taking-shower', function () {
    console.warn("I'm running late!")
});
```

### Event Name Array

An event name array can be given to create *multiple* listeners with the same callback and/or context.

Delimiters are ignored in event name arrays.

```javascript
var listeners = student.on(['need more', 'sleep'], function () {
    console.warn("I'm really late!")
});
```

### Listener Map

A listener map can be given to create multiple listeners each with different callbacks, and optionally, the same given context.

Delimiters are ignored in listener maps.

```javascript
var listeners = student.on({
    forgotHomework: function () {
        console.error("I'm in trouble.");
    },
    'forgot-books': function () {
        console.error("This is bad.");
    },
});
```

## Adding Listeners

Listeners can be added via the `on()`, `once()`, `hear()`, and `hearOnce()` methods.

The `addTo()` and `moveTo()` modifiers can also be used to add listeners to a station.

```javascript
student.on('read', function () {
    console.log("The student is reading.");
});

var listeners = student.hear(teacher, 'lecture', function () {
    console.log("Someone is lecturing.");
});

// The same 'lecture' listener is now attached to both the student and teacher
listeners.addTo(student);
```

## Removing Listeners

Listeners can be removed via the `off()` and `disregard()` methods.

The `removeFrom()` and `moveTo()` modifiers can also be used to remove listeners from a station.

```javascript
// Removes all listeners from the teacher
// that were attached by the student
student.disregard(teacher);

// Remove all listeners from the station
student.off();

// Removes only the listeners that match the callback and context
student.off('study', studyCallback, studyContext);
```

```javascript
var listeners = student.on('read', function () {
    console.log("The student is reading.");
});

// Removes the listener from `student`
listeners.remove();
```

## Emitting Events

Events are emitted via a station's `emit()` method.

The first argument can be a single event name, delimited event names, or an array of event names.

All following arguments are passed to each listener's callback.

Delimiters are ignored by `emit()`.

```javascript
station.emit('lecture', 'History 101', 741);
```

## Providing Context

Context can be provided to listeners as the last argument on the following methods: `on()`, `once()`, `hear()`, `hearOnce()`, `off()`, and `disregard()`.

The `using()` modifier can be used to change the context of listeners.

```javascript
var context = new Date();

var listeners = student.on('wakeup', function () {
    this.getFullYear();
}, context);

listeners.using(new Date());
```

## Cross-emitter Listening

Cross-emitter listening is handled via the `hear()`, `hearOnce()`, and `disregard()` methods.

The following example attaches a listener to the `teacher` station. The listener will "remember" that is was attached by the `student` method.

```javascript
student.hear(teacher, 'lecture', function (book, pageNum) {
    student.sleep();
});
```

Then that listener can be removed via the `disregard()` method.

The following example removes all listeners from `teacher` that were attached by `student`.

```javascript
student.disregard(teacher);
```

## Limiting Occurrences

The number of times a listener's callback is applied can be limited.

Occurrences can be limited via the `occur()` and `once()` listener modifiers, or the `once()` and `hearOnce()` methods.

Each listener will be removed when it reaches its occurrence limit.

```javascript
student.once('talk', function () {});

student.on('talk', function () {}).occur(5);

student.hearOnce(teacher, 'lecture');

student.hear(teacher, 'lecture').once(function () {});
```

## Regular Expression Listeners

Regular expression (RegExp) listeners are disabled by default for improved performance. RegExp listeners can be enabled globally or per station by setting the `enableRegExp` option.

When enabled, RegExp listeners are recognized by a marker. The marker is single character located at the beginning of an event name.

The RegExp marker is `"%"` by default and can be changed by setting the `regExpMarker` option.

```javascript
station.on('%foo/bar/[^/]+/1', callback);
```

Aside from the marker, the general interface remains unchanged.

```javascript
station.on(['%foo/bar/[^/]+/1', 'hello-world'], callback);
```

## Listener Modifiers

Listener modifiers are located on the `EventStation.Listeners` class and provide a fluent interface for modifying Listeners.

A `Listeners` instance can be created via the `on()`, `once()`, `hear()`, `hearOnce()`, and `makeListeners()` methods.

Please refer to the [API documentation](http://morrisallison.bitbucket.org/event-station/api/) for details on each modifier.

## Browser Usage

Event-Station can be used in Web browsers that support ES5.

A minified [UMD module](https://github.com/umdjs/umd) is located at [`dist/event-station.min.js`](https://bitbucket.org/morrisallison/event-station/src/default/dist/event-station.min.js).

UMD modules are compatible with both CommonJS and AMD module loaders.

## Object Inheritance

The `EventStation` class can be extended directly.

#### ES6 & TypeScript

```javascript
class Teacher extends EventStation {}
```

#### CoffeeScript

```coffeescript
class Teacher extends EventStation
```

#### JavaScript (ES5)

```javascript
function Teacher () { EventStation.init(this); }
EventStation.extend(Teacher.prototype);
```

#### Object Literal

`EventStation` can also be mixed into any object.

```javascript
var student = EventStation.extend({ name: 'Johnny', });
EventStation.init(student);
```