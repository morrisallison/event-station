expect = require 'must'
EventStation = require 'event-station'

describe 'An extended CoffeeScript class', ->

    class Teacher extends EventStation

    it 'must work as an EventStation instance', ->

        studentHeardLecture = false;
        teacher = new Teacher
        student = new EventStation
        student.hear teacher, 'lecture', () ->
            studentHeardLecture = true
        student.isHearing(teacher).must.be.true()
        teacher.emit 'lecture'
        studentHeardLecture.must.be.true()