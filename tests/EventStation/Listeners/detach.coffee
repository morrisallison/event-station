expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.detach()', ->

    station = new EventStation
    listeners = station.on 'pow boom bash', () ->
    station.listenerCount.must.equal 3
    listeners.isAttached().must.be.true()

    it 'must remove the listeners to their origin station', ->
        listeners.detach()
        station.listenerCount.must.equal 0
        listeners.isAttached().must.be.false()