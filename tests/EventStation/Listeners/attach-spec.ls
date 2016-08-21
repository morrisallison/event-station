expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#attach()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation
        listeners := station.makeListeners 'pow boom bash', !->

    it 'must add the listeners to their origin station', (,) !->
        listeners.attach()

        station.listenerCount.must.equal 3
