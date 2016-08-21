expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#stopPropagation()', (,) !->

    station = undefined
    firstApplied = undefined
    secondApplied = undefined

    beforeEach !->
        station := new EventStation
        firstApplied := 0
        secondApplied := 0

        station.on 'boom', !->
            firstApplied++
            this.stopPropagation()

        station.on 'boom', !->
            secondApplied++

    it 'allows listeners to be called before propagation is stopped', (,) !->
        station.emit 'boom'

        firstApplied.must.equal 1

    it 'don\'t call listeners after propagation is stopped', (,) !->
        station.emit 'boom'

        secondApplied.must.equal 0
