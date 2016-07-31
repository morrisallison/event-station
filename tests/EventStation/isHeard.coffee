expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.isHeard()', ->
    teacher = new EventStation
    student = new EventStation

    it 'must determine whether the station is being heard any other stations', ->
        teacher.isHeard().must.be.false()
        student.hear teacher, 'lecturing', () ->
        teacher.isHeard().must.be.true()

    it 'must determine whether the station is being heard on specific events', ->
        teacher.isHeard('lecturing').must.be.true()
        teacher.isHeard('talk').must.be.false()