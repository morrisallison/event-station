expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.attach()', ->

    station = new EventStation
    listeners = station.makeListeners 'pow boom bash', () ->
    station.listenerCount.must.equal 0
    listeners.isAttached().must.be.false()

    it 'must add the listeners to their origin station', ->
        listeners.attach()
        station.listenerCount.must.equal 3
        listeners.isAttached().must.be.true()