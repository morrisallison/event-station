expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#addListener()', (,) !->

    station = undefined
    stationMeta = undefined
    listener = undefined

    beforeEach !->
        station := new EventStation
        stationMeta := station.stationMeta
        listener :=
            eventName: 'boom'
            callback: ->
            context: station
            matchCallback: ->
            matchContext: undefined

    it 'must attach the listener', (,) !->
        station.hasListener listener .must.false()

        station.addListener listener

        station.hasListener listener .must.true()

    it 'must increase the listener count', (,) !->
        station.listenerCount.must.equal 0

        station.addListener listener

        station.listenerCount.must.equal 1

    it 'must attach the exact same listener multiple times', (,) !->
        station.listenerCount.must.equal 0

        station.addListener listener
        station.addListener listener

        station.listenerCount.must.equal 2
