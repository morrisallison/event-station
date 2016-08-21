expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#isHearing()', (,) !->
    student = undefined
    parent = undefined
    teacher = undefined

    beforeEach !->
        student := new EventStation
        parent := new EventStation
        teacher := new EventStation

        student.hear teacher, 'lecture', !->

    it 'must determine that the station is not hearing any station', (,) !->
        teacher.isHearing().must.be.false()

    it 'must determine that the station is not hearing a specific station', (,) !->
        teacher.isHearing(student).must.be.false()

    it 'must determine that the station is hearing any station', (,) !->
        student.isHearing().must.be.true()

    it 'must determine that the station is hearing a specific station', (,) !->
        student.isHearing(teacher).must.be.true()

    it 'must determine that the station is not hearing a specific station', (,) !->
        student.isHearing(parent).must.be.false()

    it 'must determine that the station is hearing a specific event for a specific station', (,) !->
        student.isHearing(teacher, 'lecture').must.be.true()

    it 'must determine that the station is not hearing a specific event for a specific station', (,) !->
        student.isHearing(teacher, 'talk').must.be.false()
