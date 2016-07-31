expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.get()', ->
    station = new EventStation
    listeners = station.on 'boom pow bam', () ->
    station.listenerCount.must.equal 3

    it 'must retrieve the listener from the given index', ->
        listeners.get(1).must.equal listeners.listeners[1]