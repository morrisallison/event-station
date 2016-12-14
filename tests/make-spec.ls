expect = require 'must'
EventStation = require '../src/main' .default

describe 'EventStation.make()', (,) !->

    it "must create an extended object literal", !->
        station = EventStation.make()

        expect(station.emit).to.be.a.function()

    it "must initialize the object literal", !->
        station = EventStation.make()

        expect(station.stationMeta).to.be.an.object()
