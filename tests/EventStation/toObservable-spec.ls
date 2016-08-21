expect = require 'must'
rx = require 'rx'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#toObservable()', (,) !->

    action = undefined
    actionApplied = undefined
    complete = undefined
    completeApplied = undefined
    error = undefined
    errorApplied = undefined
    station = undefined

    beforeEach !->
        EventStation.inject 'rx', rx
        station := new EventStation()
        actionApplied := 0
        errorApplied := 0
        completeApplied := 0
        action := (x) !->
            actionApplied++
        error := (err) !->
            errorApplied++
        complete := !->
            completeApplied++

    afterEach !->
        EventStation.reset()

    it 'must throw an error if Rx has not been injected', (,) !->
        EventStation.inject 'rx', undefined
        check = !->
            station.toObservable 'boom'

        check.must.throw Error

    it 'must create a working Rx observable', (,) !->
        source = station.toObservable 'boom'
        subscription = source.subscribe action, error, complete
        station.emit 'boom'

        actionApplied.must.equal 1

        subscription.dispose()
