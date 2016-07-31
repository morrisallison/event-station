expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.disregard()', ->

    station1 = new EventStation
    station2 = new EventStation
    station3 = new EventStation

    it 'must do nothing', ->
        station1.hearingCount.must.equal 0
        station1.disregard()
        station1.hearingCount.must.equal 0

    it 'must remove the listener', ->
        station1.hearingCount.must.equal 0
        station1.hear station2, 'boom'
        station1.hearingCount.must.equal 1
        station1.disregard()
        station1.hearingCount.must.equal 0

    it 'must remove one listener', ->
        station1.hearingCount.must.equal 0
        station1.hear station2, 'boom'
        station1.hear station3, 'boom'
        station1.hearingCount.must.equal 2
        station1.disregard([station2])
        station1.hearingCount.must.equal 1

    it 'must remove both listeners', ->
        station1.hearingCount.must.equal 1
        station1.hear station2, 'boom'
        station1.hearingCount.must.equal 2
        station1.disregard([station2, station3])
        station1.hearingCount.must.equal 0

    it 'must not throw an error', ->
        (() ->
            station1.disregard new Date
        ).must.not.throw(Error)

    it 'must throw an error', ->
        station1.hear station2, 'boom'
        (() ->
            station1.disregard new Date
        ).must.throw(Error)