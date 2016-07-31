expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.once()', ->
    car = new EventStation
    applied = 0

    car.on('drive').once ->
        applied++

    it 'must attach a listener to the station', ->
        driveListener = car.stationMeta.listenersMap.drive[0]
        expect(driveListener).to.be.an.object()

    it 'must restrict the listener to one application', ->
        applied.must.equal(0)
        car.emit('drive')
        applied.must.equal(1)
        car.emit('drive')
        applied.must.equal(1)