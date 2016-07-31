expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.addListener()', ->

    it 'must attach the listener', ->

        station = new EventStation
        stationMeta = station.stationMeta
        callback = () ->
        station.addListener
            eventName: 'boom'
            callback: callback
            context: station
            matchCallback: callback
            matchContext: undefined
        station.listenerCount.must.equal 1
        stationMeta.listenersMap.boom.must.be.an.array()

    it 'must attach the listener multiple times', ->

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
        stationMeta.listenersMap.boom[0].must.equal listener
        stationMeta.listenersMap.boom[1].must.equal listener