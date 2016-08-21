expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#disregard()', (,) !->
    station1 = undefined
    station2 = undefined
    station3 = undefined

    beforeEach !->
        station1 := new EventStation
        station2 := new EventStation
        station3 := new EventStation

    it 'must not alter stations when they\'re not hearing anything', (,) !->
        station1.hearingCount.must.equal 0

        station1.disregard()

        station1.hearingCount.must.equal 0

    it 'must remove the listener', (,) !->
        station1.hear station2, 'boom'

        station1.hearingCount.must.equal 1

        station1.disregard()

        station1.hearingCount.must.equal 0

    it 'must remove one listener', (,) !->
        station1.hear station2, 'boom'
        station1.hear station3, 'boom'

        station1.hearingCount.must.equal 2

        station1.disregard [station2]

        station1.hearingCount.must.equal 1

    it 'must remove multiple listeners from different stations', (,) !->
        station1.hear station2, 'boom'
        station1.hear station3, 'boom'

        station1.hearingCount.must.equal 2

        station1.disregard [station2, station3]

        station1.hearingCount.must.equal 0

    it 'must remove listeners for a specific event', (,) !->
        station1.hear station2, 'boom'
        station1.hear station2, 'pow'

        station1.hearingCount.must.equal 2

        station1.disregard station2, 'boom'

        station1.hearingCount.must.equal 1

    it 'must remove listeners for a specific callback', (,) !->
        callback = ->
        station1.hear station2, 'boom', callback
        station1.hear station2, 'boom', ->

        station1.hearingCount.must.equal 2

        station1.disregard station2, 'boom', callback

        station1.hearingCount.must.equal 1

    it 'must remove listeners for a specific context', (,) !->
        callback = ->
        context = new Date()
        station1.hear station2, 'boom', callback, context
        station1.hear station2, 'boom', callback, new Date()

        station1.hearingCount.must.equal 2

        station1.disregard station2, 'boom', callback, context

        station1.hearingCount.must.equal 1

    it 'must not remove listeners that don\'t match', (,) !->
        callback = ->
        station1.hear station2, 'pow', callback

        station1.hearingCount.must.equal 1

        station1.disregard station2, 'bam', callback

        station1.hearingCount.must.equal 1

    it 'must accept a listener map', (,) !->
        listenerMap =
            boom: !->
            pow: !->
            bam: !->

        station1.hear station2, listenerMap

        station1.hearingCount.must.equal 3

        station1.disregard station2, listenerMap

        station1.hearingCount.must.equal 0

    it 'must not throw an error', (,) !->
        check = !->
            station1.disregard new Date

        check.must.not.throw()

    it 'must throw an error', (,) !->
        station1.hear station2, 'boom'

        check = !->
            station1.disregard new Date

        check.must.throw Error
