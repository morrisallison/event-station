# Usage

This guide will explain the general usage of Event-Station.

More examples can be found in the [Examples document](./Examples.md), or in the [tests](../tests).

## Table of Contents

* [Terminology](#terminology)
* [Configuration](#configuration)
    * [Options](#options)
    * [Reset](#reset)
* [Listeners](#listeners)
    1. [Single Event String](#single-event-name)
    2. [Delimited Event Strings](#delimited-event-names)
    3. [Event String Array](#event-name-array)
    4. [Listener Map](#listener-map)
* [Attaching Listeners](#attaching-listeners)
* [Removing Listeners](#removing-listeners)
* [Asynchronous Listeners](#asynchronous-listeners)
* [Emitting Events](#emitting-events)
* [Providing Context](#providing-context)
* [Cross-emitter Listening](#cross-emitter-listening)
* [Limiting Occurrences](#limiting-occurrences)
* [Regular Expression Listeners](#regular-expression-listeners)
* [Listener Modifiers](#listener-modifiers)
* [Browser Usage](#browser-usage)
* [Inheritance](#object-inheritance)
    * [ES6](#es6)
    * [ES5](#es5)
    * [CoffeeScript](#coffeescript)
    * [Object Literal](#object-literal)

## Terminology

* `student` and `teacher` are used as examples of `EventStation` instances.

## Configuration

Event-Station can be configured globally using the `config()` static method.

```javascript
EventStation.config(options);
```

`EventStation` instances can configured during initialization by giving the constructor an object of options.

```javascript
new EventStation(options);
```

Other objects can be configured and initialized by using the `init()` static method.

```javascript
let emitter = {};

EventStation.init(emitter, options);
```

### Options

#### emitAllEvent

Determines whether an emitter emits an `"all"` event for every event that is emitted.

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

#### enableRegExp

Determines whether an emitter can use regular expression listeners.

| Type      | Default |
| --------- | ------- |
| `boolean` | `false` |

#### regExpMarker

The character used to mark regular expression listeners.

| Type      | Default |
| --------- | ------- |
| `string`  | `"%"`   |

#### enableDelimiter

Determines whether an emitter can use delimited event names.

| Type      | Default |
| --------- | ------- |
| `boolean` | `true`  |

#### delimiter

The character used to delimit event names in a string.

| Type      | Default       |
| --------- | ------------- |
| `string`  | `" "` (space) |

### Reset

Global configuration can be reset without affecting existing stations by invoking `EventStation.reset();`

_**Note:** Invoking the global reset also resets injected dependencies._

## Listeners

Each listener is an object with its own state. As a result, listeners can maintain their state while being paused or detached from emitters.

Listener methods on the `EventStation` class share the same basic interface, which accepts:

* A `string` with a single event
```javascript
"foo"
```
* A `string` of delimited events
```javascript
"foo bar"
```
* An `Array` of `string` events
```javascript
["foo", "bar"]
```
* A listener map with events as keys and callbacks as properties
```javascript
{
    foo: function () {},
    bar: function () {},
}
```

### Single Event

A single event can be given to create one listener for one event.

```javascript
let listeners = student.on('wakeup', function () {
    console.error("No, five more minutes, please.")
});
```

### Delimited Event

Delimited events can be given to create multiple listeners with the same callback and/or context.

By default, events are delimited by spaces. This can be changed by setting the [`delimiter`](#delimiter) option.

```javascript
let listeners = student.on('eating-breakfast taking-shower', function () {
    console.warn("I'm running late!")
});
```

### Event Array

An array of events can be given to create multiple listeners with the same callback and/or context.

Delimiters are ignored in event arrays.

```javascript
let listeners = student.on(['need more', 'sleep'], function () {
    console.warn("I'm really late!")
});
```

### Listener Map

A listener map can be given to create multiple listeners, each with a different callback.
Optionally, a shared context can also be given.

_**Note:** Delimiters are ignored in listener maps._

```javascript
let listeners = student.on({
    forgotHomework: function () {
        console.error("I'm in trouble.");
    },
    'forgot-books': function () {
        console.error("This is bad.");
    },
});
```

## Attaching Listeners

Listeners can be added via the `on()`, `once()`, `hear()`, and `hearOnce()` methods.

The `addTo()` and `moveTo()` listener modifiers can also be used to add listeners to an emitter.

```javascript
student.on('read', function () {
    console.log("The student is reading.");
});

let listeners = student.hear(teacher, 'lecture', function () {
    console.log("Someone is lecturing.");
});

// The same listener is now listening for 'lecture' events by both the student and teacher.
listeners.addTo(student);
```

## Removing Listeners

Listeners can be removed via the `off()` and `disregard()` methods.

The `removeFrom()` and `moveTo()` listener modifiers can also be used to remove listeners from an emitter.

The `off()` listener modifier will remove the collection of listeners from *all* emitters.

```javascript
// Removes all listeners from the teacher
// that were attached by the student
student.disregard(teacher);

// Remove all listeners from the emitter
student.off();

// Removes only the listeners that match the callback and context
student.off('study', studyCallback, studyContext);
```

```javascript
let listeners = student.on('read', function () {
    console.log("The student is reading.");
});

// Removes the listener from all emitters, including the `student`
listeners.off();
```

## Asynchronous Listeners

An asynchronous listener has a callback that returns a `Promise` compatible object.

Examples of asynchronous listeners:

```javascript
emitter.on('foo', function () {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 2000);
    });
});

emitter.on('bar', function () {
    return Promise.reject();
});
```

The `emit()` method doesn't recognize asynchronous listeners, and will simply iterate over them as per normal.
The `emitAsync()` method will capture the returned promises, and return a new promise that will resolve,
when all of the captured promises have resolved.

```javascript
emitter.emitAsync(['foo', 'bar']).then(function () {
    console.log('All "foo" and "bar" listeners have completed.');
});
```

_See the [Asynchronous Listeners](./Examples.md#asynchronous-listeners) example._

To clarify, both synchronous and asynchronous listeners can be attached to an emitter, listening to the same event,
and invoked with either `emit()` or `emitAsync()`. However, only `emitAsync()` will handle promises.

In short, `emitAsync()` should be used whenever you want to make sure, that all invoked listeners have finished handling an event.

## Emitting Events

Events are emitted via an emitter's `emit()` or `emitAsync()` methods.

The first argument can be an event string, a string of delimited events, or an array of events.

All arguments after the first are passed to each listener's callback function.

```javascript
teacher.on('lecture', function (bookTitle, pageNumber) {
    // We're reading page 741 in History 101.
    console.log(`We're reading page ${pageNumber} in ${bookTitle}.`);
});

teacher.emit('lecture', 'History 101', 741);
```

## Providing Context

Context can be provided as the last argument on methods that attach listeners.

The `using()` listener modifier can be used to change the context of listeners.

```javascript
let context = new Date();

let listeners = student.on('wakeup', function () {
    this.getFullYear();
}, context);

listeners.using(new Date());
```

## Cross-emitter Listening

Cross-emitter listening is handled via the `hear()`, `hearOnce()`, and `disregard()` methods.

In the following example, the `student` emitter attaches a listener to the `teacher` emitter.
The listener will "remember" that is was attached by the `student` method.

```javascript
student.hear(teacher, 'lecture', function (bookTitle, pageNumber) {
    student.sleep();
});
```

After the listener is attached, it can be removed via the `disregard()` method.

The following example removes all listeners from the `teacher` that were attached by the `student`.

```javascript
student.disregard(teacher);
```

## Limiting Occurrences

The number of times a listener's callback is invoked can be limited.

Occurrences can be limited via the `occur()` and `once()` listener modifiers, or the `once()` and `hearOnce()` methods.

When a listener reaches its occurrence limit, it will be removed from all emitters which it's attached to.

```javascript
student.once('talk', function () {});

student.on('talk', function () {}).occur(5);

student.hearOnce(teacher, 'lecture');

student.hear(teacher, 'lecture').once(function () {});
```

## Regular Expression Listeners

Regular expression (RegExp) listeners are disabled by default for improved performance.
RegExp listeners can be enabled globally or per emitter by setting the [`enableRegExp`](#enableRegExp) option.

When enabled, RegExp listeners are recognized by a marker. The marker is a single character located at the beginning of an event.

The RegExp marker is `"%"` by default and can be changed by setting the [`regExpMarker`](#regExpMarker) option.

```javascript
emitter.on('%foo/bar/[^/]+/1', callback);
```

Aside from the marker, the general interface remains unchanged.
In the following code, both a RegExp listener and a normal listener, will be attached to the emitter.

```javascript
emitter.on(['%foo/bar/[^/]+/1', 'hello-world'], callback);
```

## Listener Modifiers

Listener modifiers are located on the `EventStation.Listeners` class and provide a fluent interface for modifying Listeners.

A `Listeners` instance can be created via the `on()`, `once()`, `hear()`, `hearOnce()`, `makeListeners()`, and `getListeners()` methods.

Please refer to the [module definition](https://github.com/morrisallison/event-station/blob/master/dist/event-station.d.ts) for details on each modifier.

## Browser Usage

Event-Station can be used in Web browsers that support ES5.

Please view the section on [installation](../README.md#installation) for how to load Event-Station in a Web browser.

If Event-Station is loaded via a `<script>` tag, an `EventStation` global will be assigned.

## Inheritance

The `EventStation` class can be extended directly.

#### ES6

```javascript
class Teacher extends EventStation {}

/* true */ new Teacher instanceof EventStation;
```

#### ES5

```javascript
function Teacher () {
    EventStation.init(this);
}

EventStation.extend(Teacher.prototype);

/* false */ new Teacher instanceof EventStation;
```

```javascript
function Teacher () {
    EventStation.init(this);
}

Teacher.prototype = new EventStation;

/* true */ new Teacher instanceof EventStation;
```

#### CoffeeScript

```coffeescript
class Teacher extends EventStation
```

#### Object Literal

`EventStation` can also be mixed into any object.

```javascript
let student = EventStation.extend({ name: 'Johnny', });

EventStation.init(student);

/* false */ student instanceof EventStation;
```

The `make()` method can also be used to create an initialized object literal.

```javascript
let emitter = EventStation.make();

/* false */ emitter instanceof EventStation;
```
