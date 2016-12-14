expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#off()', (,) !->

    listeners = undefined
    listeners2 = undefined
    station = undefined
    station2 = undefined

    beforeEach !->
        station := new EventStation
        station2 := new EventStation
        listeners := station.on 'boom', ->
        listeners2 := station.on 'bam', ->

    it 'must remove listeners', (,) !->
        listeners.off()

        station.listenerCount.must.equal 1

    it 'must remove listeners from all stations', (,) !->
        listeners.addTo station2

        station2.listenerCount.must.equal 1

        listeners.off()

        station2.listenerCount.must.equal 0

    it 'must not error with listeners that aren\'t attached to any stations', (,) !->
        check = !->
            listeners.off()
            listeners.off()

        check.must.not.throw()
