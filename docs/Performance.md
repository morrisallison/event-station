# Performance Overview

*Updated 10/24/2015*

An overview of the performance of Event-Station compared to other event emitters; benchmarks included.

## Conclusion / TL;DR

* Event-Station ...
    - is a good choice when its versatile API is taken advantage of.
    - serves well as a standalone alternative to Backbone.Events.
    - has consistent performance. This is especially true when compared to EventEmitter2.
    - can be configured to increase performance. Configuration can be set globally or per instance.
* Projects that will only utilize basic features would be better served by other solutions.

## Benchmarks

The results below were from [benchmarks](https://github.com/morrisallison/event-station/blob/master/benchmarks/) run on Node.js v4.2.1 using the following modules:

* EventEmitter &mdash; `v4.2.1`
* EventEmitter2 &mdash; `v0.4.14`
* EventEmitter3 &mdash; `v1.1.1`
* Event-Station &mdash; `v1.0.0-beta`
* Backbone.Events &mdash; `v1.2.3`

***Event-Station (2)***

Event-Station (2) is using the `removeFrom()` listener modifier. Delimiters, RegExp listeners, and `all` events disabled.

***Event-Station (3)***

Event-Station (3) is using pre-built listeners, and the `attach()` &amp; `detach()` listener modifiers. Delimiters, RegExp listeners, and `all` events disabled.

### Basic Features

#### Events and callbacks

```
EventEmitter      x 2,231,522 ops/sec ±2.95% (93 runs sampled)
EventEmitter2     x 792,052 ops/sec ±1.78% (90 runs sampled)
EventEmitter3     x 875,008 ops/sec ±1.80% (91 runs sampled)
Event-Station     x 461,602 ops/sec ±3.09% (83 runs sampled)
Event-Station (2) x 656,837 ops/sec ±2.73% (88 runs sampled)
Event-Station (3) x 856,441 ops/sec ±3.20% (89 runs sampled)
Backbone.Events   x 414,180 ops/sec ±3.43% (88 runs sampled)

Fastest is EventEmitter
```

#### Events only

```
EventEmitter      x 2,143,171 ops/sec ±1.34% (90 runs sampled)
EventEmitter2     x 8,503,018 ops/sec ±1.26% (92 runs sampled)
EventEmitter3     x 994,160 ops/sec ±1.75% (90 runs sampled)
Event-Station     x 540,360 ops/sec ±1.29% (95 runs sampled)
Event-Station (2) x 620,741 ops/sec ±2.07% (91 runs sampled)
Event-Station (3) x 826,766 ops/sec ±1.53% (91 runs sampled)
Backbone.Events   x 403,808 ops/sec ±1.64% (92 runs sampled)

Fastest is EventEmitter2
```

#### Event Emission

```
EventEmitter      x 21,417,375 ops/sec ±1.38% (92 runs sampled)
EventEmitter2     x 20,618,387 ops/sec ±1.11% (94 runs sampled)
EventEmitter3     x 18,779,478 ops/sec ±1.09% (91 runs sampled)
Event-Station     x 4,725,182 ops/sec ±1.35% (90 runs sampled)
Event-Station (2) x 9,822,738 ops/sec ±1.45% (93 runs sampled)
Backbone.Events   x 3,589,921 ops/sec ±1.29% (94 runs sampled)

Fastest is EventEmitter
```

### Advanced Features

#### Wildcards, events and callbacks

<small>EventEmitter, EventEmitter3, and Backbone.Events are excluded as they don't have wildcard functionality.</small>

<small>(M) denotes when the wildcard was placed in the middle of the expression, rather than at the end.</small>

```
EventEmitter2         x 198,347 ops/sec ±1.43% (91 runs sampled)
EventEmitter2 (M)     x 125,436 ops/sec ±1.51% (91 runs sampled)
Event-Station         x 215,196 ops/sec ±1.59% (90 runs sampled)
Event-Station (M)     x 211,231 ops/sec ±1.54% (92 runs sampled)
Event-Station (2)     x 241,381 ops/sec ±1.59% (90 runs sampled)
Event-Station (2) (M) x 251,259 ops/sec ±1.37% (92 runs sampled)
Event-Station (3)     x 275,528 ops/sec ±1.37% (91 runs sampled)
Event-Station (3) (M) x 251,093 ops/sec ±1.83% (90 runs sampled)

Fastest is Event-Station (3)
```

#### Context, events and callbacks

<small>EventEmitter and EventEmitter2 are excluded as they don't have context functionality.</small>

```
EventEmitter3     x 903,920 ops/sec ±4.29% (86 runs sampled)
Event-Station     x 513,928 ops/sec ±4.35% (85 runs sampled)
Event-Station (2) x 693,791 ops/sec ±2.93% (89 runs sampled)
Event-Station (3) x 857,492 ops/sec ±3.74% (88 runs sampled)
Backbone.Events   x 389,296 ops/sec ±3.04% (85 runs sampled)

Fastest is EventEmitter3
```

#### Cross-emitter listening, and events

<small>EventEmitter, EventEmitter2, and EventEmitter3 are excluded as they don't have cross-emitter listening functionality.</small>

```
Event-Station     x 219,960 ops/sec ±1.80% (90 runs sampled)
Event-Station (2) x 407,111 ops/sec ±1.42% (92 runs sampled)
Event-Station (3) x 809,995 ops/sec ±1.26% (93 runs sampled)
Backbone.Events   x 156,032 ops/sec ±1.25% (92 runs sampled)

Fastest is Event-Station (3)
```

#### Cross-emitter listening, events, and callbacks

<small>EventEmitter, EventEmitter2, and EventEmitter3 are excluded as they don't have cross-emitter listening functionality.</small>

```
Event-Station     x 226,910 ops/sec ±1.27% (91 runs sampled)
Event-Station (2) x 432,881 ops/sec ±1.23% (93 runs sampled)
Event-Station (3) x 826,265 ops/sec ±1.49% (92 runs sampled)
Backbone.Events   x 155,316 ops/sec ±1.50% (90 runs sampled)

Fastest is Event-Station (3)
```

#### Cross-emitter listening, events, callbacks, and contexts

<small>EventEmitter, EventEmitter2, and EventEmitter3 are excluded as they don't have cross-emitter listening functionality.</small>

```
Event-Station     x 223,326 ops/sec ±1.47% (90 runs sampled)
Event-Station (2) x 420,718 ops/sec ±1.60% (91 runs sampled)
Event-Station (3) x 782,638 ops/sec ±1.28% (91 runs sampled)
Backbone.Events   x 150,038 ops/sec ±1.66% (92 runs sampled)

Fastest is Event-Station (3)
```
