expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.stopPropagation()', ->
    station = new EventStation
    firstApplied = 0
    secondApplied = 0

    station.on 'boom', () ->
        firstApplied++
        this.stopPropagation()

    station.on 'boom', () ->
        secondApplied++

    station.listenerCount.must.equal 2

    it 'must stop propagation', ->
        station.emit('boom')
        firstApplied.must.equal 1
        secondApplied.must.equal 0