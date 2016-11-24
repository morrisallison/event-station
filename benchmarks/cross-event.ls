Benchmark = require 'benchmark'
niv = require 'npm-install-version'
EventStation = require '../dist/event-station'

niv.install 'backbone'
niv.install 'underscore'

Backbone = niv.require 'backbone'
underscore = niv.require 'underscore'

suite = new Benchmark.Suite()
backbone = undefined
backboneListenedTo = undefined
callback = undefined
emitter = undefined
emitter2 = undefined
emitter3 = undefined
listeners = undefined
speedOptions = undefined
station = undefined
stationHeard = undefined
stationConfigured = undefined
stationHeardConfigured = undefined

console.log "Event and cross-emitter listening"

suite
    .on 'start cycle', !->
        callback := !-> 1 == 1
        speedOptions := { enableRegExp: false, enableDelimiter: false, emitAllEvent: false }
        station := new EventStation()
        stationHeard := new EventStation()
        stationConfigured := new EventStation speedOptions
        stationHeardConfigured := new EventStation speedOptions
        listeners := stationConfigured.hear stationHeardConfigured, 'foobar', callback
        listeners.detach()
        backbone := underscore.extend {}, Backbone.Events
        backboneListenedTo := underscore.extend {}, Backbone.Events

    .add 'Event-Station (unconfigured station#disregard)', !->
        station.hear stationHeard, 'foobar', callback
        stationHeard.emit 'foobar'
        station.disregard stationHeard, 'foobar'

    .add 'Event-Station (station#disregard)', !->
        stationConfigured.hear stationHeardConfigured, 'foobar', callback
        stationHeardConfigured.emit 'foobar'
        stationConfigured.disregard stationHeardConfigured, 'foobar'

    .add 'Event-Station (listeners#removeFrom)', !->
        listeners = stationConfigured.hear stationHeardConfigured, 'foobar', callback
        stationHeardConfigured.emit 'foobar'
        listeners.removeFrom stationHeardConfigured

    .add 'Event-Station (listeners#detach)', !->
        listeners.attach();
        stationHeardConfigured.emit 'foobar'
        listeners.detach();

    .add 'Backbone.Events', !->
        backbone.listenTo backboneListenedTo, 'foobar', callback
        backboneListenedTo.trigger 'foobar'
        backbone.stopListening backboneListenedTo, 'foobar'

    .on 'cycle', (event, bench) !->
        console.log event.target.toString()

    .on 'complete', !->
        console.log '\nFastest is ' + this.filter('fastest').map('name')

    .run true
