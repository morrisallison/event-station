expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.config()', ->

    it "must set the global default options", ->
        EventStation.config
            emitAllEvent: false
            delimiter: ','

    it "must set `emitAllEvent` to be `false` by default", ->
        station = new EventStation
        station.stationMeta.emitAllEvent.must.be.false()

    it "must set `delimiter` to be a comma by default", ->
        station = new EventStation
        station.stationMeta.delimiter.must.be.equal ','

    it "must still allow options to be overridden", ->
        station = new EventStation
            emitAllEvent: true
        station.stationMeta.emitAllEvent.must.be.true()