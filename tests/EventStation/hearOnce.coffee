expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.hearOnce()', ->

    student = new EventStation
    teacher = new EventStation
    applied = 0

    teacher.hearOnce student, 'ask', ->
        applied++

    it 'must attach a listener to the other station', ->
        askListener = student.stationMeta.listenersMap.ask[0]
        expect(askListener).to.be.an.object()

    it 'must restrict the listener to one application', ->
        applied.must.equal(0)
        student.emit('ask')
        applied.must.equal(1)
        student.emit('ask')
        applied.must.equal(1)