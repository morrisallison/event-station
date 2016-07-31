expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.hasListener()', ->

    station = new EventStation
    stationMeta = station.stationMeta
    callback = () ->
    context = new Date
    listeners = station.on 'boom', callback, context
    station.listenerCount.must.equal 1

    listener = listeners.listeners[0]
    listenerClone = {}
    for own key, value of listener
        listenerClone[key] = value

    it 'must determine that the listener has been attached by only giving an event name', ->
        station.hasListener
            eventName: 'boom'
        .must.be.true()

    it 'must determine that the listener hasn\'t been attached by only giving an event name', ->
        station.hasListener
            eventName: 'pow'
        .must.be.false()

    it 'must determine that the listener hasn\'t been attached by giving a different context', ->
        station.hasListener
            eventName: 'boom'
            matchContext: new Date
        .must.be.false()

    it 'must determine that the listener has been attached by giving a matching listener', ->
        station.hasListener(listenerClone).must.be.true()

    it 'must determine that the listener hasn\'t been attached by setting the exact match flag', ->
        station.hasListener(listenerClone, true).must.be.false()