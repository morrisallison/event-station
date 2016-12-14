expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#detach()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must remove the listeners to their origin station', (,) !->
        listeners.detach()

        station.listenerCount.must.equal 0
