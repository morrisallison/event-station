expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#addTo()', (,) !->
    station = undefined
    station2 = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation
        station2 := new EventStation
        listeners := station.hear station2, 'boom', !->
        station2.listenerCount.must.equal 1

    it 'must throw an error when a cross-emitter listener is attached to a station other than its origin', (,) !->
        check = !-> listeners.addTo station
        check.must.throw Error

    it 'must attach a cross-emitter listener to its origin station', (,) !->
        listeners.off()
        station2.listenerCount.must.equal 0
        listeners.addTo station2
        station2.listenerCount.must.equal 1
