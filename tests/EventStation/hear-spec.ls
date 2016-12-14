expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation#hear()', (,) !->
    student = undefined
    teacher = undefined

    beforeEach !->
        student := new EventStation
        teacher := new EventStation

    it 'must attach a listener to the other station', (,) !->
        student.hear teacher, 'lecturing', !->
        student.hearingCount.must.equal 1
        teacher.listenerCount.must.equal 1

    it 'must have set the correct event name', (,) !->
        student.hear teacher, 'lecturing', !->
        lecturingListener = teacher.stationMeta.listenersMap.lecturing[0]

        lecturingListener.eventName.must.equal 'lecturing'

    it "must have set the first station as the context", !->
        student.hear teacher, 'lecturing', !->
        lecturingListener = teacher.stationMeta.listenersMap.lecturing[0]

        lecturingListener.context.must.equal student

    it "must have set `undefined` as the `matchContext`", !->
        student.hear teacher, 'lecturing', !->
        lecturingListener = teacher.stationMeta.listenersMap.lecturing[0]

        expect(lecturingListener.matchContext).to.be.undefined()
