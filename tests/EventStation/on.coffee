expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.on()', ->

    do ->
        station = new EventStation
        stationMeta = station.stationMeta
        callback = (str) ->
        context = new Date
        listener1 = undefined
        listener2 = undefined

        it 'must attach a listener to the station', ->
            station.on 'boom', callback
            stationMeta.listenerCount.must.equal 1
            expect(stationMeta.listenersMap.boom).to.not.be.undefined()
            listener1 = stationMeta.listenersMap.boom[0]
            expect(listener1).to.be.an.object()

        it 'must have set the correct event name', ->
            listener1.eventName.must.equal 'boom'

        it "must have set the station as the context", ->
            listener1.context.must.equal station
            expect(listener1.matchContext).to.be.undefined()

        it "must have set the callback without modification", ->
            listener1.callback.must.equal callback

        it "must have set the `matchCallback` without modification", ->
            listener1.matchCallback.must.equal callback
            station.on 'boom', callback, context

        it 'must attach a second listener to the station', ->
            stationMeta.listenerCount.must.equal 2
            expect(stationMeta.listenersMap.boom).to.not.be.undefined()
            listener2 = stationMeta.listenersMap.boom[1]
            expect(listener2).to.be.an.object()

        it 'must have set the correct event name', ->
            listener2.eventName.must.equal 'boom'

        it "must have set the given context", ->
            listener2.context.must.equal context
            listener2.matchContext.must.equal context

        it "must have set the callback without modification", ->
            listener2.callback.must.equal callback

        it "must have set the `matchCallback` without modification", ->
            listener2.matchCallback.must.equal callback

    do ->
        listenerMap =
            pow: () ->
            bang: () ->
            boom: () ->

        station = new EventStation
        station.on listenerMap
        stationMeta = station.stationMeta

        it 'must add three listeners to the station with a listener map', ->
            stationMeta.listenerCount.must.equal 3

    do ->
        eventNames = 'its over 9000'

        station = new EventStation
        station.on eventNames, () ->
        stationMeta = station.stationMeta

        it 'must add three listeners to the station with a delimited string', ->
            stationMeta.listenerCount.must.equal 3

    do ->
        station = new EventStation

        it 'must throw an error', ->
            (() ->
                station.on true, () ->
            ).must.throw(Error)

        it 'must not throw an error', ->
            (() ->
                station.on new Date, () ->
            ).must.not.throw(Error)

    do ->
        station = new EventStation
        station.on 'boom'
        stationMeta = station.stationMeta

        it 'must add a listener without a callback', ->
            stationMeta.listenerCount.must.equal 1
            expect(stationMeta.listenersMap.boom).to.be.an.array()
            listener = stationMeta.listenersMap.boom[0]
            expect(listener.callback).to.be.undefined
            expect(listener.matchCallback).to.be.undefined