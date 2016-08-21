expect = require 'must'
EventStation = require '../src/EventStation' .EventStation

describe 'EventStation.init()', (,) !->

    station = undefined
    stationMeta = undefined

    beforeEach !->
        station := {}
        options =
            emitAllEvent: false
            delimiter: ','
            enableRegExp: true
            enableDelimiter: false

        EventStation.init station, options

        stationMeta := station.stationMeta

    it "must create a `stationMeta` property on the given object", !->
        expect(stationMeta).to.be.an.object()

    it "must set the `emitAllEvent` option to `false`", !->
        stationMeta.emitAllEvent.must.be.false()

    it "must set the `enableDelimiter` option to `false`", !->
        stationMeta.enableDelimiter.must.be.false()

    it "must set the `enableRegExp` option to `true`", !->
        stationMeta.enableRegExp.must.be.true()

    it "must set the `delimiter` option to a comma", !->
        stationMeta.delimiter.must.equal ','

    it "must set the `hearingCount` property to zero (0)", !->
        stationMeta.hearingCount.must.equal 0

    it "must set the `listenerCount` property to zero (0)", !->
        stationMeta.listenerCount.must.equal 0

    it "must set the `isPropagationStopped` option to `false`", !->
        stationMeta.isPropagationStopped.must.be.false()

    it "must set the `listenersMap` property to an object with a `NULL` prototype", !->
        expect(stationMeta.listenersMap).to.be.an.object()
        expect(Object.getPrototypeOf(stationMeta.listenersMap)).to.be.null()

    it "must set the `heardStations` property to an object with a `NULL` prototype", !->
        expect(stationMeta.heardStations).to.be.an.object()
        expect(Object.getPrototypeOf(stationMeta.heardStations)).to.be.null()

describe 'EventStation.init()', (,) !->

    station = undefined

    beforeEach !->
        station := {}

    it "must throw an error when the delimiter is an empty string", !->
        check = !->
            EventStation.init station, { delimiter: '' }

        check.must.throw Error

    it "must throw an error when the RegExp marker is an empty string", !->
        check = !->
            EventStation.init station, { regExpMarker: '' }

        check.must.throw Error

    it "must throw an error when the RegExp marker contains the delimiter", !->
        check = !->
            EventStation.init station, { regExpMarker: 'this has spaces' }

        check.must.throw Error
