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
callback = !-> 1 == 1
context = new Date()
speedOptions = { enableRegExp: false, enableDelimiter: false, emitAllEvent: false }
station = new EventStation()
station2 = new EventStation speedOptions
backbone = underscore.extend {}, Backbone.Events
emitter = new EventEmitter()
emitter2 = new EventEmitter2()
emitter3 = new EventEmitter3()

console.log 'Emit'

emitter.on 'foobar', callback
emitter2.on 'foobar', callback
emitter3.on 'foobar', callback
station.on 'foobar', callback
station2.on 'foobar', callback
backbone.on 'foobar', callback

suite
    .add 'EventEmitter', !->
        emitter.emit 'foobar'

    .add 'EventEmitter2 ', !->
        emitter2.emit 'foobar'

    .add 'EventEmitter3 ', !->
        emitter3.emit 'foobar'

    .add 'Event-Station', !->
        station.emit 'foobar'

    .add 'Event-Station (configured)', !->
        station2.emit 'foobar'

    .add 'Backbone.Events ', !->
        backbone.trigger 'foobar'

    .on 'cycle', (event, bench) !->
        console.log event.target.toString()

    .on 'complete', !->
        console.log '\nFastest is ' + this.filter('fastest').map('name')

    .run true
