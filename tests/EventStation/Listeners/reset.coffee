expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.reset()', ->

    station = new EventStation
    station2 = new EventStation
    listeners = station.on 'boom', () ->
    listeners.occur 3
    station.emit 'boom'
    listeners.pause()

    station.listenerCount.must.equal 1
    listeners.listeners[0].maxOccurrences.must.equal 3
    listeners.listeners[0].occurrences.must.equal 1
    listeners.listeners[0].isPaused.must.be.true()

    listeners.reset()

    it 'must clear the occurrences', ->
        expect(listeners.listeners[0].occurrences).to.be.undefined()

    it 'must clear the paused state', ->
        expect(listeners.listeners[0].isPaused).to.be.undefined()