expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation', (,) !->

    Teacher = undefined

    before !->
        class TeacherEventStation extends EventStation
        Teacher := TeacherEventStation

    it 'interoperates with CoffeeScript/LiveScript classes', (,) !->
        studentHeardLecture = false
        teacher = new Teacher
        student = new EventStation

        student.hear teacher, 'lecture', !->
            studentHeardLecture := true

        student.isHearing(teacher).must.be.true()

        teacher.emit 'lecture'

        studentHeardLecture.must.be.true()
