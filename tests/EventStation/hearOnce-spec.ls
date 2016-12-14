expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation#hearOnce()', (,) !->

    student = undefined
    teacher = undefined
    timesApplied = undefined
    listeners = undefined

    beforeEach !->
        student := new EventStation
        teacher := new EventStation
        timesApplied := 0

        listeners := teacher.hearOnce student, 'ask', (,) !->
            timesApplied++

    it 'must attach a listener to the other station', (,) !->
        listener = student.getListeners().get 0

        listener.must.be.an.object()

    it 'must remove the listener from the other station after the last occurrence', (,) !->
        student.getListeners().count.must.equal 1

        student.emit 'ask'
        student.emit 'ask'

        expect student.getListeners() .to.be.undefined()

    it 'must restrict the listener to one application', (,) !->
        timesApplied.must.equal 0

        student.emit 'ask'
        student.emit 'ask'

        timesApplied.must.equal 1
