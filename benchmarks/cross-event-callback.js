var Benchmark = require('benchmark');
var EventStation = require('event-station');
var Backbone = require('backbone');
var _ = require('underscore');

var suite = new Benchmark.Suite();
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
var backbone2 = _.extend({}, Backbone.Events);
var callback = function () { 1 == 1; }
var listeners = station.hear(station3, 'foobar', callback);
listeners.detach();

console.log("Event, callback, and cross-emitter listening");

suite

    .add('Event-Station', function () {
        station.hear(station2, 'foobar', callback);
        station2.emit('foobar');
        station.disregard(station2, 'foobar', callback);
    })

    .add('Event-Station (2)', function () {
        var listeners = station.hear(station2, 'foobar', callback);
        station2.emit('foobar');
        listeners.removeFrom(station2);
    })

    .add('Event-Station (3)', function () {
        listeners.attach();
        station3.emit('foobar');
        listeners.detach();
    })

    .add('Backbone.Events', function () {
        backbone.listenTo(backbone2, 'foobar', callback);
        backbone2.trigger('foobar');
        backbone.stopListening(backbone2, 'foobar', callback);
    })

    .on('cycle', function (event, bench) {
        console.log(String(event.target));
    })

    .on('complete', function () {
        console.log('\nFastest is ' + this.filter('fastest').pluck('name'));
    })

    .run(true);