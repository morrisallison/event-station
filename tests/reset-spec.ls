expect = require 'must'
Promise = require 'bluebird'
rx = require 'rx'
EventStation = require '../src/main' .default
injector = require '../src/injector'

describe 'EventStation.config()', (,) !->
    beforeEach !->
        EventStation.config { emitAllEvent: false }
        EventStation.inject 'Promise', Promise

    it "must reset global configuration", !->
        new EventStation().stationMeta.emitAllEvent.must.be.false()

        EventStation.reset()

        new EventStation().stationMeta.emitAllEvent.must.be.true()

    it "must not affect the configuration of existing stations", !->
        station = new EventStation

        station.stationMeta.emitAllEvent.must.be.false()

        EventStation.reset()

        station.stationMeta.emitAllEvent.must.be.false()

    it "must reset injected dependencies", !->
        EventStation.inject 'rx', rx

        check = !->
            new EventStation().toObservable 'boom'

        check.must.not.throw()

        EventStation.reset()

        check.must.throw Error

describe 'EventStation.config()', (,) !->
    before !->
        global.window = {}
        window.Promise = 'foo'

    after !->
        delete global.window
        injector.inject('Promise', Promise)

    it "must inject the window promise if available", !->
        EventStation.reset()

        injector.getPromise().must.equal window.Promise
