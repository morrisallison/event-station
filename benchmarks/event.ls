Benchmark = require 'benchmark'
EventEmitter = require 'events' .EventEmitter
niv = require 'npm-install-version'
EventStation = require '../dist/event-station'

niv.install 'backbone'
niv.install 'eventemitter2'
niv.install 'eventemitter3'
niv.install 'underscore'

Backbone = niv.require 'backbone'
EventEmitter2 = niv.require 'eventemitter2' .EventEmitter2
EventEmitter3 = niv.require 'eventemitter3'
underscore = niv.require 'underscore'

suite = new Benchmark.Suite()
backbone = undefined
callback = undefined
emitter = undefined
emitter2 = undefined
emitter3 = undefined
listeners = undefined
speedOptions = undefined
station = undefined
stationConfigured = undefined

console.log 'Event only'

suite
    .on 'start cycle', !->
        callback := !-> 1 == 1
        speedOptions :=
            enableRegExp: false
            enableDelimiter: false
            emitAllEvent: false
        station := new EventStation()
        stationConfigured := new EventStation speedOptions
        listeners := stationConfigured.makeListeners 'foobar', callback
        backbone := underscore.extend {}, Backbone.Events
        emitter := new EventEmitter()
        emitter2 := new EventEmitter2()
        emitter3 := new EventEmitter3()

    .add 'EventEmitter', !->
        emitter.on 'foobar', callback
        emitter.emit 'foobar'
        emitter.removeAllListeners 'foobar'

    .add 'EventEmitter2', !->
        emitter2.on 'foobar', callback
        emitter2.emit 'foobar'
        emitter2.removeAllListeners 'foobar'

    .add 'EventEmitter3', !->
        emitter3.on 'foobar', callback
        emitter3.emit 'foobar'
        emitter3.removeAllListeners 'foobar'

    .add 'Event-Station (unconfigured)', !->
        station.on 'foobar', callback
        station.emit 'foobar'
        station.off 'foobar'

    .add 'Event-Station (configured)', !->
        stationConfigured.on 'foobar', callback
        stationConfigured.emit 'foobar'
        stationConfigured.off 'foobar'

    .add 'Event-Station (listeners#removeFrom)', !->
        listeners = stationConfigured.on 'foobar', callback
        stationConfigured.emit 'foobar'
        listeners.removeFrom stationConfigured

    .add 'Event-Station (listeners#detach)', !->
        listeners.attach()
        stationConfigured.emit 'foobar'
        listeners.detach()

    .add 'Backbone.Events', !->
        backbone.on 'foobar', callback
        backbone.trigger 'foobar'
        backbone.off 'foobar'

    .on 'cycle', (event, bench) !->
        console.log event.target.toString()

    .on 'complete', !->
        console.log '\nFastest is ' + this.filter('fastest').map('name')

    .run true
