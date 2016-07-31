expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.isAttached()', ->

    callback = (str) ->
    station = new EventStation
    listeners = station.on 'boom', callback
    station.listenerCount.must.equal 1

    it 'must determine that the listeners are attached', ->
        listeners.isAttached().must.be.true()

    it 'must determine that the listeners aren\'t attached', ->
        listeners.off()
        listeners.isAttached().must.be.false()