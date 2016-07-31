expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.has()', ->

    station = new EventStation
    callback = () ->
    context = new Date
    listenersObj = station.on 'pow boom bash', callback, context
    listeners = listenersObj.listeners
    station.listenerCount.must.equal 3
    matchingListener = listenersObj.get(0)

    it 'must determine that a given listener has a matching listener', ->
        listenersObj.has(matchingListener).must.be.true()

    it 'must determine that a given object has a matching listener', ->
        listenersObj.has({ eventName: 'boom' }).must.be.true()

    it 'must determine that a given listener has an exact match', ->
        listenersObj.has(matchingListener, true).must.be.true()

    it 'must determine that a given object dones\'t have an exact match', ->
        listenersObj.has({ eventName: 'boom' }, true).must.be.false()