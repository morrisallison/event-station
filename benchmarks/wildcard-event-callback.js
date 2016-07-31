var Benchmark = require('benchmark');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var EventStation = require('event-station');
var suite = new Benchmark.Suite();
var emitter2 = new EventEmitter2({
    wildcard: true
});
var station = new EventStation({
    enableRegExp: true
});
var station2 = new EventStation({
    enableRegExp: true,
    enableDelimiter: false,
    emitAllEvent: false,
});
var station3 = new EventStation({
    enableRegExp: true,
    enableDelimiter: false,
    emitAllEvent: false,
});
var callback = function () { 1 == 1; }
var listeners = station3.makeListeners('%^foo/bar/[^/]+', callback);
var listenersM = station3.makeListeners('%^foo/[^/]+/1', callback);

console.log('Wildcard, event, and callback');

suite

    .add('EventEmitter2 ', function () {
        emitter2.on('foo.bar.*', callback);
        emitter2.emit('foo.bar.1');
        emitter2.off('foo.bar.*', callback);
    })

    .add('EventEmitter2 (M)', function () {
        emitter2.on('foo.*.1', callback);
        emitter2.emit('foo.bar.1');
        emitter2.off('foo.*.1', callback);
    })

    .add('Event-Station', function () {
        station.on('%^foo/bar/[^/]+', callback);
        station.emit('foo/bar/1');
        station.off('%^foo/bar/[^/]+', callback);
    })

    .add('Event-Station (M)', function () {
        station.on('%^foo/[^/]+/1', callback);
        station.emit('foo/bar/1');
        station.off('%^foo/[^/]+/1', callback);
    })

    .add('Event-Station (2)', function () {
        var listeners = station2.on('%^foo/bar/[^/]+', callback);
        station2.emit('foo/bar/1');
        listeners.removeFrom(station2);
    })

    .add('Event-Station (2) (M)', function () {
        var listeners = station2.on('%^foo/[^/]+/1', callback);
        station2.emit('foo/bar/1');
        listeners.removeFrom(station2);
    })

    .add('Event-Station (3)', function () {
        listeners.attach();
        station3.emit('foo/bar/1');
        listeners.detach();
    })

    .add('Event-Station (3) (M)', function () {
        listenersM.attach();
        station3.emit('foo/bar/1');
        listenersM.detach();
    })

    .on('cycle', function (event, bench) {
        console.log(String(event.target));
    })

    .on('complete', function () {
        console.log('\nFastest is ' + this.filter('fastest').pluck('name'));
    })

    .run(true);