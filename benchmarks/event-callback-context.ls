Benchmark = require 'benchmark'
niv = require 'npm-install-version'
EventStation = require '../dist/event-station'

niv.install 'backbone'
niv.install 'eventemitter3'
niv.install 'underscore'

Backbone = niv.require 'backbone'
EventEmitter3 = niv.require 'eventemitter3'
underscore = niv.require 'underscore'

suite = new Benchmark.Suite()
backbone = undefined
callback = undefined
context = undefined
emitter3 = undefined
listeners = undefined
speedOptions = undefined
station = undefined
stationConfigured = undefined

console.log 'Event only'

suite
    .on 'start cycle', !->
        callback := !-> 1 == 1
        context := new Date()
        speedOptions :=
            enableRegExp: false
            enableDelimiter: false
            emitAllEvent: false
        station := new EventStation()
        stationConfigured := new EventStation speedOptions
        listeners := stationConfigured.makeListeners 'foobar', callback, context
        backbone := underscore.extend {}, Backbone.Events
        emitter3 := new EventEmitter3()

    .add 'EventEmitter3', !->
        emitter3.on 'foobar', callback, context
        emitter3.emit 'foobar'
        emitter3.removeAllListeners 'foobar', callback, context

    .add 'Event-Station (unconfigured)', !->
        station.on 'foobar', callback, context
        station.emit 'foobar'
        station.off 'foobar', callback, context

    .add 'Event-Station (configured)', !->
        stationConfigured.on 'foobar', callback, context
        stationConfigured.emit 'foobar'
        stationConfigured.off 'foobar', callback, context

    .add 'Event-Station (listeners#removeFrom)', !->
        listeners = stationConfigured.on 'foobar', callback, context
        stationConfigured.emit 'foobar'
        listeners.removeFrom stationConfigured

    .add 'Event-Station (listeners#detach)', !->
        listeners.attach()
        stationConfigured.emit 'foobar'
        listeners.detach()

    .add 'Backbone.Events', !->
        backbone.on 'foobar', callback, context
        backbone.trigger 'foobar'
        backbone.off 'foobar', callback, context

    .on 'cycle', (event, bench) !->
        console.log event.target.toString()

    .on 'complete', !->
        console.log '\nFastest is ' + this.filter('fastest').map('name')

    .run true
