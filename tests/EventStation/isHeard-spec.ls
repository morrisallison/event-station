expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#isHeard()', (,) !->

    teacher = undefined
    student = undefined

    before !->
        teacher := new EventStation
        student := new EventStation

    it 'must determine whether the station is being heard any other stations', (,) !->
        teacher.isHeard().must.be.false()

        student.hear teacher, 'lecturing', !->

        teacher.isHeard().must.be.true()

    it 'must determine whether the station is being heard on specific events', (,) !->
        student.hear teacher, 'lecturing', !->

        teacher.isHeard 'lecturing' .must.be.true()

    it 'must determine whether the station is not being heard on specific events', (,) !->
        student.hear teacher, 'lecturing', !->

        teacher.isHeard 'talk' .must.be.false()

    it 'must determine whether the station is being heard by specific callbacks', (,) !->
        callback = ->
        student.hear teacher, 'lecturing', callback

        teacher.isHeard 'lecturing', callback .must.be.true()

    it 'must determine whether the station is not being heard by specific callbacks', (,) !->
        student.hear teacher, 'lecturing', !->

        teacher.isHeard 'lecturing', !-> .must.be.false()

    it 'must determine whether the station is being heard by specific context', (,) !->
        callback = ->
        context = new Date()
        student.hear teacher, 'lecturing', callback, context

        teacher.isHeard 'lecturing', callback, context .must.be.true()

    it 'must determine whether the station is not being heard by specific context', (,) !->
        callback = ->
        context = new Date()
        student.hear teacher, 'lecturing', callback, context

        teacher.isHeard 'lecturing', callback, new Date() .must.be.false()
