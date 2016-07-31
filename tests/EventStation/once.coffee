expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.once()', ->
    rocket = new EventStation
    applied = 0

    rocket.once 'launch', () ->
        applied++

    it 'must attach a listener to the station', ->
        launchListener = rocket.stationMeta.listenersMap.launch[0]
        expect(launchListener).to.be.an.object()

    it 'must restrict the listener to one application', ->
        applied.must.equal(0)
        rocket.emit('launch')
        applied.must.equal(1)
        rocket.emit('launch')
        applied.must.equal(1)