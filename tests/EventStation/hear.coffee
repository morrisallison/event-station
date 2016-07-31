expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.hear()', ->
    teacher = new EventStation
    student = new EventStation
    lecturingListener = undefined

    it 'must attach a listener to the other station', ->
        student.hear teacher, 'lecturing', () ->
        student.hearingCount.must.equal 1
        teacher.listenerCount.must.equal 1

        lecturingListener = teacher.stationMeta.listenersMap.lecturing[0]
        expect(lecturingListener).to.be.an.object()

    it 'must have set the correct event name', ->
        lecturingListener.eventName.must.equal 'lecturing'

    it "must have set the first station as the context", ->
        lecturingListener.context.must.equal student

    it "must have set `undefined` as the `matchContext`", ->
        expect(lecturingListener.matchContext).to.be.undefined()