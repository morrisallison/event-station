var Benchmark = require('benchmark');
var EventStation = require('event-station');
var EventEmitter3 = require('eventemitter3');
var Backbone = require('backbone');
var _ = require('underscore');

var suite = new Benchmark.Suite();
var emitter3 = new EventEmitter3();
var station = new EventStation();
var station2 = new EventStation({
    enableRegExp: false,
    enableDelimiter: false,
    emitAllEvent: false,
});
var station3 = new EventStation({
    enableRegExp: false,
    enableDelimiter: false,
    emitAllEvent: false,
});
var backbone = _.extend({}, Backbone.Events);
var callback = function () { 1 == 1; }
var context = new Date();
var listeners = station3.makeListeners('foobar', callback, context);

console.log('Event, callback, and context');

suite

    .add('EventEmitter3 ', function () {
        emitter3.on('foobar', callback, context);
        emitter3.emit('foobar');
        emitter3.off('foobar', callback);
    })

    .add('Event-Station', function () {
        station.on('foobar', callback, context);
        station.emit('foobar');
        station.off('foobar', callback, context);
    })

    .add('Event-Station (2)', function () {
        var listeners = station2.on('foobar', callback, context);
        station2.emit('foobar');
        listeners.removeFrom(station2);
    })

    .add('Event-Station (3)', function () {
        listeners.attach();
        station3.emit('foobar');
        listeners.detach();
    })

    .add('Backbone.Events', function () {
        backbone.on('foobar', callback, context);
        backbone.trigger('foobar');
        backbone.off('foobar', callback, context);
    })

    .on('cycle', function (event, bench) {
        console.log(String(event.target));
    })

    .on('complete', function () {
        console.log('\nFastest is ' + this.filter('fastest').pluck('name'));
    })

    .run(true);