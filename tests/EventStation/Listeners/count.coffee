expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.count()', ->

    station = new EventStation
    listeners = station.on 'pow boom bash', () ->
    station.listenerCount.must.equal 3

    it 'must return the number of listeners in the collection', ->
        listeners.count.must.equal 3