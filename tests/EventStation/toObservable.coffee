expect = require 'must'
rx = require 'rx'
EventStation = require 'event-station'

describe 'EventStation.prototype.toObservable()', ->
    station = new EventStation
    actionApplied = 0
    errorApplied = 0
    completeApplied = 0
    action = (x) ->
        actionApplied++
    error = (err) ->
        errorApplied++
    complete = () ->
        completeApplied++

    it 'must throw an error if Rx has not been injected ', ->
        (() ->
            station.toObservable 'boom'
        ).must.throw Error

    it 'must create a working Rx observable', ->

        # Ensure that Rx is available for the test
        EventStation.inject 'rx', rx

        source = station.toObservable 'boom'
        subscription = source.subscribe action, error, complete
        station.emit 'boom'
        actionApplied.must.equal 1
        subscription.dispose()