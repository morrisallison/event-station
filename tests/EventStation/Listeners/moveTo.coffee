expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.moveTo()', ->

    station = new EventStation
    station2 = new EventStation
    listeners = station.on 'boom', () ->
    station.listenerCount.must.equal 1

    it 'must move the listener', ->
        listeners.moveTo(station2)
        station.listenerCount.must.equal 0
        station2.listenerCount.must.equal 1