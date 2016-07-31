expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.off()', ->

    callback = (str) ->
    station = new EventStation
    listeners = station.on 'boom', callback
    listeners2 = station.on 'boom', callback
    station.listenerCount.must.equal 2

    it 'must remove the first listener', ->
        listeners.off()
        station.listenerCount.must.equal 1

    it 'must remove the other listener', ->
        listeners2.off()
        station.listenerCount.must.equal 0

    it 'must remove the listener from both stations', ->
        station2 = new EventStation
        listeners.addTo station
        station.listenerCount.must.equal 1
        listeners.addTo station2
        station2.listenerCount.must.equal 1
        listeners.off()
        station.listenerCount.must.equal 0
        station2.listenerCount.must.equal 0