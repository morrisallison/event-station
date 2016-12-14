expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation#on()', (,) !->
    callback = undefined
    context = undefined
    station = undefined
    stationMeta = undefined

    beforeEach !->
        callback := ->
        context := new Date
        station := new EventStation
        stationMeta := station.stationMeta

    it 'must increase the listener count', (,) !->
        station.on 'boom', callback

        stationMeta.listenerCount.must.equal 1

    it 'must attach a listener to the listeners map', (,) !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        expect(listener).to.be.an.object()

    it 'must have set the correct event name', (,) !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        listener.eventName.must.equal 'boom'

    it 'must have set the station as the context', !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        listener.context.must.equal station

    it 'must set no match context', !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        expect(listener.matchContext).to.be.undefined()

    it 'must have set the callback without modification', !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        listener.callback.must.equal callback

    it 'must have set the `matchCallback` without modification', !->
        station.on 'boom', callback
        listener = stationMeta.listenersMap.boom[0]

        listener.matchCallback.must.equal callback

    it 'must attach a second listener to the station', (,) !->
        station.on 'boom', callback
        station.on 'boom', callback, context

        stationMeta.listenerCount.must.equal 2

    it 'must attach a second listener to the station with the correct event name', (,) !->
        station.on 'boom', callback
        station.on 'boom', callback, context

        listener = stationMeta.listenersMap.boom[1]
        listener.eventName.must.equal 'boom'

    it 'must have set the given context', !->
        station.on 'boom', callback, context
        listener = stationMeta.listenersMap.boom[0]

        listener.context.must.equal context

    it 'must have set the given match context', !->
        station.on 'boom', callback, context
        listener = stationMeta.listenersMap.boom[0]

        listener.matchContext.must.equal context

    it 'must have set the match callback without modification', !->
        station.on 'boom', callback, context
        listener = stationMeta.listenersMap.boom[0]

        listener.matchCallback.must.equal callback

    it 'must add three listeners to the station with a listener map', (,) !->
        listenerMap =
            pow: !->
            bang: !->
            boom: !->

        station.on listenerMap

        stationMeta.listenerCount.must.equal 3

    it 'must add three listeners to the station with a space delimited string', (,) !->
        events = 'its over 9000'
        station.on events, ->

        stationMeta.listenerCount.must.equal 3

    it 'must add one listener for an event with spaces when the delimiter is disabled', (,) !->
        station.stationMeta.enableDelimiter = false
        events = 'its over 9000'
        station.on events, ->

        stationMeta.listenerCount.must.equal 1

    it 'must throw an error', (,) !->
        check = !-> station.on true, ->

        check.must.throw Error

    it 'must not throw an error', (,) !->
        check = !-> station.on new Date, ->

        check.must.not.throw()

    it 'must add a listener without a callback', (,) !->
        station.on 'boom'
        listener = stationMeta.listenersMap.boom[0]

        expect(listener.callback).to.be.undefined
