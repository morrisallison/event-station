expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#moveTo()', (,) !->

    station = undefined
    station2 = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        station2 := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must add the listeners to the given station', (,) !->
        listeners.moveTo(station2)

        station.listenerCount.must.equal 0

    it 'must remove the listeners from the origin station', (,) !->
        listeners.moveTo(station2)

        station2.listenerCount.must.equal 3
