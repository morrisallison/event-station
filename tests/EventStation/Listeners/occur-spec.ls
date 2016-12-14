expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#occur()', (,) !->

    station = undefined
    station2 = undefined
    listeners = undefined
    timesApplied = undefined

    beforeEach !->
        station := new EventStation()
        station2 := new EventStation()
        timesApplied := 0
        listeners := station.on 'boom', !->
            timesApplied++

    it 'must throw an error', (,) !->
        check = !->
            listeners.occur 0

        check.must.throw Error

    it 'must restrict the listener\'s occurrences', (,) !->
        listeners.occur 3

        timesApplied.must.equal 0

        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'

        timesApplied.must.equal 3

    it 'must remove the listener from the station', (,) !->
        listeners.occur 3

        station.listenerCount.must.equal 1

        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'

        station.listenerCount.must.equal 0

    it 'must remove the listener from all stations', (,) !->
        listeners.addTo station2 .occur 3

        station2.listenerCount.must.equal 1

        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'
        station.emit 'boom'

        station2.listenerCount.must.equal 0
