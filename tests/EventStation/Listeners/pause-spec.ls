expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#pause()', (,) !->

    station = undefined
    listeners = undefined
    timesApplied = undefined

    beforeEach !->
        station := new EventStation
        timesApplied := 0
        listeners := station.on 'boom', !->
            timesApplied++

    it 'must stop the listener from being applied', (,) !->
        station.emit 'boom'

        listeners.pause()

        station.emit 'boom'

        timesApplied.must.equal 1

    it 'must prevent occurrence limits from increasing', (,) !->
        listeners.occur 3

        station.listenerCount.must.equal 1

        station.emit 'boom'

        listeners.pause()

        station.emit 'boom'
        station.emit 'boom'

        station.listenerCount.must.equal 1
