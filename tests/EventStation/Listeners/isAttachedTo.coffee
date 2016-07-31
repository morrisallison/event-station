expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.isAttachedTo()', ->

    station = new EventStation
    station2 = new EventStation
    listeners = station.makeListeners 'boom', () ->
    listeners.count.must.equal 1
    station.listenerCount.must.equal 0

    it 'must determine that the listeners are not attached to any station', ->
        listeners.isAttachedTo().must.be.false()

    it 'must determine that the listeners are not attached to a given station', ->
        listeners.isAttachedTo(station).must.be.false()
        listeners.isAttachedTo(station2).must.be.false()

    it 'must determine that the listeners are attached to a given station', ->
        listeners.addTo station2
        station2.listenerCount.must.equal 1
        listeners.isAttachedTo(station).must.be.false()
        listeners.isAttachedTo(station2).must.be.true()

    it 'must determine that the listeners are attached to any station', ->
        listeners.isAttachedTo().must.be.true()

    it 'must determine that the listeners are not attached to any station after they are removed', ->
        station2.listenerCount.must.equal 1
        listeners.off()
        station2.listenerCount.must.equal 0
        listeners.isAttachedTo().must.be.false()