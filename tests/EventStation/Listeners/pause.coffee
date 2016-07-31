expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.pause()', ->

    station = new EventStation
    numApplied = 0
    callback = (str) ->
        numApplied++
    listeners = station.on 'boom', callback
    station.listenerCount.must.equal 1

    it 'must stop the listener from being applied', ->
        listeners.pause()
        station.emit 'boom'
        numApplied.must.equal 0