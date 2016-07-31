expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.getListeners()', ->

    station = new EventStation
    callback = () ->
    context = new Date

    it 'must return `undefined` if no listeners are attached to the station', ->
        expect(station.getListeners()).to.be.undefined()

    it 'must retrieve all of the listeners that are attached to the station', ->
        station.on 'pow boom bash', callback, context
        station.listenerCount.must.equal 3
        listeners = station.getListeners()
        listeners.count.must.equal 3
        listeners.has station.stationMeta.listenersMap.pow[0], true
        listeners.has station.stationMeta.listenersMap.boom[0], true
        listeners.has station.stationMeta.listenersMap.bash[0], true

    it 'must retrieve attached listeners that match a specific event', ->
        listeners = station.getListeners 'boom'
        listeners.count.must.equal 1
        listeners.has station.stationMeta.listenersMap.boom[0], true

    it 'must retrieve attached listeners that match a listener map', ->
        listeners = station.getListeners
            pow: callback
        listeners.count.must.equal 1
        listeners.has station.stationMeta.listenersMap.pow[0], true

    it 'must retrieve attached listeners that match an array of events', ->
        listeners = station.getListeners ['bash', 'pow']
        listeners.count.must.equal 2
        listeners.has station.stationMeta.listenersMap.bash[0], true
        listeners.has station.stationMeta.listenersMap.pow[0], true

    it 'must return `undefined` if no matching listeners are found', ->
        expect(station.getListeners('smash')).to.be.undefined()