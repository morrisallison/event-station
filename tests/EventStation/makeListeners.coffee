expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.makeListeners()', ->

    station = new EventStation

    it 'must create a listener without attaching it', ->
        listeners = station.makeListeners 'boom', ()->
        station.listenerCount.must.equal 0
        listeners.listeners.length.must.equal 1