expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation#hasListener()', (,) !->

    station = undefined
    stationMeta = undefined
    listenerClone = undefined
    callback = undefined
    context = undefined

    beforeEach !->
        station := new EventStation
        stationMeta := station.stationMeta
        callback := !->
        context := new Date
        listeners = station.on 'boom', callback, context
        listenerClone :=
            eventName: 'boom'
            callback: callback
            context: context

    it 'must determine that the listener has been attached by only giving an event name', (,) !->
        matchingListener =
            eventName: 'boom'

        station.hasListener matchingListener .must.be.true()

    it 'must determine that the listener hasn\'t been attached by only giving an event name', (,) !->
        matchingListener =
            eventName: 'pow'

        station.hasListener matchingListener .must.be.false()

    it 'must determine that the listener hasn\'t been attached by giving a different context', (,) !->
        matchingListener =
            eventName: 'boom'
            matchContext: new Date

        station.hasListener matchingListener .must.be.false()

    it 'must determine that the listener has been attached by giving a matching listener', (,) !->
        station.hasListener listenerClone .must.be.true()

    it 'must determine that the listener hasn\'t been attached by setting the exact match flag', (,) !->
        station.hasListener listenerClone, true .must.be.false()
