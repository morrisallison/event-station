expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#removeListener()', (,) !->

    callback = undefined
    context = undefined
    station = undefined
    station2 = undefined
    stationMeta = undefined

    beforeEach !->
        callback := ->
        context := new Date
        station := new EventStation
        station2 := new EventStation
        stationMeta := station.stationMeta

    it 'must not decrement the listener count when not listeners are attached', (,) !->
        station.listenerCount.must.equal 0

        station.removeListener eventName: 'boom'

        station.listenerCount.must.equal 0

    it 'must decrement the listener count when a listener is removed', (,) !->
        station.on 'boom', callback, context

        listener =
            eventName: 'boom'
            callback: callback
            context: context
            matchCallback: callback
            matchContext: context

        station.listenerCount.must.equal 1

        station.removeListener listener

        station.listenerCount.must.equal 0

    it 'must remove the listener', (,) !->
        station.on 'boom', callback, context

        listener =
            eventName: 'boom'
            callback: callback
            context: context
            matchCallback: callback
            matchContext: context

        expect(stationMeta.listenersMap.boom).to.exist()

        station.removeListener listener

        expect(stationMeta.listenersMap.boom).to.not.exist()

    it 'must not remove the listener based on the hearer property', (,) !->
        station2.hear station, 'boom', callback, context
        listener =
            eventName: 'boom'
            hearer: station

        expect(stationMeta.listenersMap.boom).to.exist()

        station.removeListener listener

        expect(stationMeta.listenersMap.boom).to.exist()

    it 'must not remove listeners that aren\'t the same object, when the exact match flag is set', (,) !->
        station.on 'boom', callback, context

        listener =
            eventName: 'boom'
            callback: callback
            context: context
            matchCallback: callback
            matchContext: context

        expect(stationMeta.listenersMap.boom).to.exist()

        station.removeListener listener, true

        expect(stationMeta.listenersMap.boom).to.exist()

    it 'must remove all instances of the same listener', (,) !->
        listener =
            eventName: 'boom'
            callback: callback
            context: station
            matchCallback: callback
            matchContext: undefined

        station.addListener listener
        station.listenerCount.must.equal 1
        station.addListener listener
        station.listenerCount.must.equal 2
        stationMeta.listenersMap.boom.must.be.an.array()
        expect(listener.stationMetas).to.be.an.array()
        listener.stationMetas.length.must.equal 2
        listener.stationMetas[0].must.equal stationMeta
        listener.stationMetas[1].must.equal stationMeta
        stationMeta.listenersMap.boom[0].must.equal listener
        stationMeta.listenersMap.boom[1].must.equal listener
        station.removeListener listener
        station.listenerCount.must.equal 0
        expect(listener.stationMetas).to.not.exist()
