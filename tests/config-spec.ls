expect = require 'must'
EventStation = require '../src/EventStation' .EventStation

describe 'EventStation.config()', (,) !->

    config = undefined

    beforeEach !->
        config :=
            emitAllEvent: false
            delimiter: ','

    afterEach !->
        EventStation.reset()

    it "must set emitAllEvent to be false by default", !->
        EventStation.config config
        station = new EventStation

        station.stationMeta.emitAllEvent.must.be.false()

    it "must set delimiter to be a comma by default", !->
        EventStation.config config
        station = new EventStation

        station.stationMeta.delimiter.must.be.equal ','

    it "must still allow options to be overridden", !->
        EventStation.config config
        station = new EventStation { emitAllEvent: true }

        station.stationMeta.emitAllEvent.must.be.true()

    it "must throw an error when the delimiter is an empty string", !->
        check = !->
            EventStation.config { delimiter: '' }

        check.must.throw Error

    it "must throw an error when the RegExp marker is an empty string", !->
        check = !->
            EventStation.config { regExpMarker: '' }

        check.must.throw Error

    it "must throw an error when the RegExp marker contains the delimiter", !->
        check = !->
            EventStation.config { regExpMarker: 'this has spaces' }

        check.must.throw Error
