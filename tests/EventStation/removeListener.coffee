expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.removeListener()', ->

    station = new EventStation
    station2 = new EventStation
    stationMeta = station.stationMeta
    callback = () ->
    context = new Date

    it 'must do nothing', ->
        station.listenerCount.must.equal 0
        station.removeListener eventName: 'boom'
        station.listenerCount.must.equal 0

    it 'must remove the listener', ->

        listeners = station.on 'boom', callback, context
        station.listenerCount.must.equal 1

        station.removeListener
            eventName: 'boom'
            callback: callback
            context: context
            matchCallback: callback
            matchContext: context

        station.listenerCount.must.equal 0
        expect(stationMeta.listenersMap.boom).to.be.undefined()

    it 'must not remove the listener based on the hearer property', ->

        listeners = station2.hear station, 'boom', callback, context
        station.listenerCount.must.equal 1
        station.removeListener
            eventName: 'boom'
            hearer: station
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.boom).to.be.an.array()

    it 'must not remove the listener', ->

        listeners = station.on 'boom', callback, context
        station.listenerCount.must.equal 2

        station.removeListener
            eventName: 'boom'
            callback: callback
            context: context
            matchCallback: callback
            matchContext: context
        , true

        station.listenerCount.must.equal 2
        expect(stationMeta.listenersMap.boom).to.be.an.array()

    do ->

        it 'must remove all instances of the same listener', ->

            station = new EventStation
            stationMeta = station.stationMeta
            callback = () ->
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
            expect(listener.stationMetas).to.be.undefined()