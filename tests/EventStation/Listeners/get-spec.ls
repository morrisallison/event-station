expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#get()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must retrieve the listener from the given index', (,) !->
        listeners.get 1 .must.equal listeners.listeners[1]
