expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.index()', ->
    station = new EventStation
    listeners = station.on 'boom pow bam', () ->
    station.listenerCount.must.equal 3

    it 'must retrieve the index of the given listener', ->
        listeners.index(listeners.listeners[1]).must.equal 1

    it 'must return `undefined` when the given listener isn\'t found', ->
        expect(listeners.index({})).to.be.undefined()