expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#count()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must return the number of listeners in the collection', (,) !->
        listeners.count.must.equal 3
