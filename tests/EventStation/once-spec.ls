expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#once()', (,) !->

    station = undefined
    timesApplied = undefined

    beforeEach !->
        station := new EventStation
        timesApplied := 0

    it 'must attach a listener to the station', (,) !->
        station.once 'bang', !->
            timesApplied++

        station.listenerCount.must.be 1

    it 'must restrict the listener to one application', (,) !->
        station.once 'bang', !->
            timesApplied++

        timesApplied.must.equal 0

        station.emit 'bang'
        station.emit 'bang'

        timesApplied.must.equal 1
