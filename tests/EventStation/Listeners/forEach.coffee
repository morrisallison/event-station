expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.forEach()', ->

    station = new EventStation
    listenersObj = station.on 'pow boom bash', () ->
    station.listenerCount.must.equal 3

    it 'must iterate over the listeners similar to Array.prototype.forEach()', ->
        listenersObj.forEach (listener, index, listeners) ->
            listeners.must.equal listenersObj.listeners
            listenersObj.listeners[index].must.equal listener