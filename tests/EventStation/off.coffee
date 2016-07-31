expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.off()', ->

    callback = (str) ->
    station = new EventStation
    station2 = new EventStation
    stationMeta = station.stationMeta
    context = new Date()
    listenerMap =
        pow: () ->
        bang: () ->
        boom: () ->
    eventNames = ['its', 'over', '9000']

    it 'must do nothing if no listeners are attached', ->
        station.listenerCount.must.equal 0
        result = station.off()
        expect(result).to.be.undefined()
        station.listenerCount.must.equal 0

    it 'must remove both listeners', ->
        station.on 'boom', callback
        station.on 'boom', callback
        station.listenerCount.must.equal 2
        station.off 'boom'
        expect(stationMeta.listenersMap.boom).to.be.undefined()

    it 'must reduce the listener count', ->
        station.listenerCount.must.equal 0

    it 'must remove one listener', ->
        station.on 'boom', callback
        station.on 'boom', () ->
        station.off 'boom', callback
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.boom).to.be.an.array()

    it 'must do nothing if no listeners are listening to an event', ->
        station.listenerCount.must.equal 1
        station.off 'pow'
        station.listenerCount.must.equal 1

    it 'must reduce the hearingCount when removing all listeners for a particular event', ->
        station.hear station2, 'bang', () ->
        station2.listenerCount.must.equal 1
        station.hearingCount.must.equal 1
        station2.off 'bang'
        station.hearingCount.must.equal 0
        station2.listenerCount.must.equal 0

    it 'must reduce the hearingCount when removing all listeners', ->
        station.hear station2, 'bang', () ->
        station2.listenerCount.must.equal 1
        station.hearingCount.must.equal 1
        station2.off()
        station.hearingCount.must.equal 0
        station2.listenerCount.must.equal 0

    it 'must remove a listener for specific event', ->
        station.on 'bang', () ->
        station.listenerCount.must.equal 2
        station.off 'boom'
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.boom).to.be.undefined()

    it 'must remove all listeners', ->
        station.on 'pow', callback
        station.listenerCount.must.equal 2
        station.on 'boom', callback, new Date()
        station.listenerCount.must.equal 3
        station.off()
        station.listenerCount.must.equal 0
        expect(stationMeta.listenersMap.pow).to.be.undefined()
        expect(stationMeta.listenersMap.boom).to.be.undefined()
        expect(stationMeta.listenersMap.bang).to.be.undefined()

    it 'must remove multiple listeners for specific events', ->
        station.listenerCount.must.equal 0
        station.on 'pow', callback
        station.on 'pow', callback
        station.on 'boom', callback
        station.on 'boom', callback
        station.listenerCount.must.equal 4
        station.off 'boom', callback
        station.listenerCount.must.equal 2
        expect(stationMeta.listenersMap.pow).to.be.an.object()
        expect(stationMeta.listenersMap.boom).to.be.undefined()
        station.off 'pow', callback
        expect(stationMeta.listenersMap.pow).to.be.undefined()
        station.listenerCount.must.equal 0

    it 'must leave the listener attached', ->
        station.listenerCount.must.equal 0
        station.on 'boom', callback, context
        station.listenerCount.must.equal 1
        station.off 'boom', callback, station
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.boom).to.be.an.array()

    it 'must remove the attached listener matching the given context', ->
        station.listenerCount.must.equal 1
        station.off 'boom', callback, context
        station.listenerCount.must.equal 0
        expect(stationMeta.listenersMap.boom).to.be.undefined()

    it 'must remove the listeners matching the given listener map', ->
        station.listenerCount.must.equal 0
        station2.listenerCount.must.equal 0
        station.on listenerMap
        station.listenerCount.must.equal 3
        station2.hear station, 'bash'
        station.listenerCount.must.equal 4
        station.off listenerMap
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.boom).to.be.undefined()
        expect(stationMeta.listenersMap.bash).to.be.an.array()

    it 'must remove the listener the was attached via hear()', ->
        station.listenerCount.must.equal 1
        station.off 'bash'
        station.listenerCount.must.equal 0
        expect(stationMeta.listenersMap.bash).to.be.undefined()

    it 'must remove the listeners that match the given array of events', ->
        station.listenerCount.must.equal 0
        station.on eventNames, () ->
        station.listenerCount.must.equal 3
        station.off ['its', 'over']
        station.listenerCount.must.equal 1
        expect(stationMeta.listenersMap.its).to.be.undefined()
        expect(stationMeta.listenersMap.over).to.be.undefined()
        expect(stationMeta.listenersMap['9000']).to.be.an.array()