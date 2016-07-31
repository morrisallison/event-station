expect = require 'must'
bluebird = require 'bluebird'
EventStation = require 'event-station'

describe 'Listeners.prototype.race()', ->

    applied = 0
    promiseApplied = 0
    callback = () ->
        applied++
    station = new EventStation
    listeners = station.on 'boom pow bash', callback
    station.listenerCount.must.equal 3

    it 'make a promise that resolves as soon as one of the listeners is applied', (done) ->

        # Use Bluebird Promise implementation for the test
        EventStation.inject 'Promise', bluebird

        listeners.race().then () ->
            promiseApplied++
            applied.must.equal 1
            done()

        station.emit 'boom'

        setTimeout () ->
            applied.must.equal 1
            promiseApplied.must.equal 1
            station.emit 'boom'

            setTimeout () ->
                applied.must.equal 2
                promiseApplied.must.equal 1
            , 0
        , 0