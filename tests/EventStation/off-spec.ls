expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#off()', (,) !->

    station = undefined
    station2 = undefined
    stationMeta = undefined
    callback = undefined
    context = undefined

    beforeEach !->
        station := new EventStation
        station2 := new EventStation
        stationMeta := station.stationMeta
        callback := !->
        context := new Date()

    it 'must do nothing if no listeners are attached', (,) !->
        result = station.off()

        station.listenerCount.must.equal 0

    it 'must remove multiple listeners', (,) !->
        station.on 'boom', callback
        station.on 'boom', callback

        station.listenerCount.must.equal 2

        station.off 'boom'

        station.listenerCount.must.equal 0

    it 'must remove a listener matching the given parameters', (,) !->
        station.on 'boom', callback
        station.on 'boom', !->

        station.listenerCount.must.equal 2

        station.off 'boom', callback

        station.listenerCount.must.equal 1

    it 'must do nothing if no listeners are listening to an event', (,) !->
        station.on 'boom'

        station.listenerCount.must.equal 1

        station.off 'pow'

        station.listenerCount.must.equal 1

    it 'must reduce the hearingCount when removing listeners for a specific event', (,) !->
        station.hear station2, 'bang', !->
        station.hear station2, 'pow', !->

        station.hearingCount.must.equal 2

        station2.off 'bang'

        station.hearingCount.must.equal 1

    it 'must remove all listeners when no arguments are given', (,) !->
        station.on 'bang'
        station.on 'pow'

        station.listenerCount.must.equal 2

        station.off()

        station.listenerCount.must.equal 0

    it 'must reduce the hearingCount when removing all listeners', (,) !->
        station.hear station2, 'bang', !->
        station.hear station2, 'pow', !->

        station.hearingCount.must.equal 2

        station2.off()

        station.hearingCount.must.equal 0

    it 'must remove multiple listeners for specific events', (,) !->
        station.on 'pow', callback
        station.on 'pow', callback
        station.on 'boom', callback
        station.on 'boom', callback

        station.listenerCount.must.equal 4

        station.off 'boom', callback

        station.listenerCount.must.equal 2

    it 'must match listeners based on their context', (,) !->
        station.on 'boom', callback, context

        station.listenerCount.must.equal 1

        station.off 'boom', callback, new Date

        station.listenerCount.must.equal 1

    it 'must remove the attached listener matching the given context', (,) !->
        station.on 'boom', callback, context

        station.listenerCount.must.equal 1

        station.off 'boom', callback, context

        station.listenerCount.must.equal 0

    it 'must remove the listeners matching the given listener map', (,) !->
        listenerMap =
            pow: !->
            bang: !->
            boom: !->

        station.on listenerMap
        station2.hear station, 'bash'

        station.listenerCount.must.equal 4

        station.off listenerMap

        station.listenerCount.must.equal 1

    it 'must remove the listeners that match the given array of events', (,) !->
        station.on ['its', 'over', '9000'], !->

        station.listenerCount.must.equal 3

        station.off ['its', 'over']

        station.listenerCount.must.equal 1
