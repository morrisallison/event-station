Benchmark = require 'benchmark'
niv = require 'npm-install-version'
EventStation = require '../dist/event-station'

niv.install 'eventemitter2'

EventEmitter2 = niv.require 'eventemitter2' .EventEmitter2

suite = new Benchmark.Suite()
callback = undefined
emitter2 = undefined
listeners = undefined
listenersMiddle = undefined
speedOptions = undefined
station = undefined
stationConfigured = undefined

console.log 'Wildcard, event, and callback'

suite
    .on 'start cycle', !->
        callback := !-> 1 == 1
        speedOptions :=
            enableRegExp: true
            enableDelimiter: false
            emitAllEvent: false
        emitter2 := new EventEmitter2 { wildcard: true }
        station := new EventStation { enableRegExp: true }
        stationConfigured := new EventStation speedOptions
        listeners := stationConfigured.makeListeners '%^foo/bar/[^/]+', callback
        listenersMiddle := stationConfigured.makeListeners '%^foo/[^/]+/1', callback

    .add 'EventEmitter2 ', !->
        emitter2.on 'foo.bar.*', callback
        emitter2.emit 'foo.bar.1'
        emitter2.off 'foo.bar.*', callback

    .add 'EventEmitter2 (middle wildcard)', !->
        emitter2.on 'foo.*.1', callback
        emitter2.emit 'foo.bar.1'
        emitter2.off 'foo.*.1', callback

    .add 'Event-Station (unconfigured) ', !->
        station.on '%^foo/bar/[^/]+', callback
        station.emit 'foo/bar/1'
        station.off '%^foo/bar/[^/]+', callback

    .add 'Event-Station (unconfigured middle wildcard)', !->
        station.on '%^foo/[^/]+/1', callback
        station.emit 'foo/bar/1'
        station.off '%^foo/[^/]+/1', callback

    .add 'Event-Station', !->
        listeners = stationConfigured.on '%^foo/bar/[^/]+', callback
        stationConfigured.emit 'foo/bar/1'
        listeners.removeFrom stationConfigured

    .add 'Event-Station (middle wildcard)', !->
        listeners = stationConfigured.on '%^foo/[^/]+/1', callback
        stationConfigured.emit 'foo/bar/1'
        listeners.removeFrom stationConfigured

    .add 'Event-Station (listeners#detach)', !->
        listeners.attach()
        stationConfigured.emit 'foo/bar/1'
        listeners.detach()

    .add 'Event-Station (listeners#detach middle wildcard)', !->
        listenersMiddle.attach()
        stationConfigured.emit 'foo/bar/1'
        listenersMiddle.detach()

    .on 'cycle', (event, bench) !->
        console.log event.target.toString()

    .on 'complete', !->
        console.log '\nFastest is ' + this.filter('fastest').map('name')

    .run true
