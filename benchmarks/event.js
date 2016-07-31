var Benchmark = require('benchmark');
var EventEmitter = require('events').EventEmitter;
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var EventEmitter3 = require('eventemitter3');
var EventStation = require('event-station');
var Backbone = require('backbone');
var _ = require('underscore');

var suite = new Benchmark.Suite();
var emitter = new EventEmitter();
var emitter2 = new EventEmitter2();
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
var listeners = station3.makeListeners('foobar', callback);

console.log('Event only');

suite

    .add('EventEmitter', function () {
        emitter.on('foobar', callback);
        emitter.emit('foobar');
        emitter.removeAllListeners('foobar');
    })

    .add('EventEmitter2', function () {
        emitter2.on('foobar', callback);
        emitter2.emit('foobar');
        emitter2.removeAllListeners('foobar');
    })

    .add('EventEmitter3', function () {
        emitter3.on('foobar', callback);
        emitter3.emit('foobar');
        emitter3.removeAllListeners('foobar');
    })

    .add('Event-Station', function () {
        station.on('foobar', callback);
        station.emit('foobar');
        station.off('foobar');
    })

    .add('Event-Station (2)', function () {
        var listeners = station2.on('foobar', callback);
        station2.emit('foobar');
        listeners.removeFrom(station2);
    })

    .add('Event-Station (3)', function () {
        listeners.attach();
        station3.emit('foobar');
        listeners.detach();
    })

    .add('Backbone.Events', function () {
        backbone.on('foobar', callback);
        backbone.trigger('foobar');
        backbone.off('foobar');
    })

    .on('cycle', function (event, bench) {
        console.log(String(event.target));
    })

    .on('complete', function () {
        console.log('\nFastest is ' + this.filter('fastest').pluck('name'));
    })

    .run(true);