expect = require 'must'
EventStation = require '../../../src/main' .default
Promise = require 'bluebird'

describe 'Listeners#toPromises()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        EventStation.inject 'Promise', Promise
        station := new EventStation
        listeners := station.makeListeners 'pow boom bash', !->

    afterEach !->
        EventStation.reset()

    it 'must throw an error if promises are not available', !->
        EventStation.inject 'Promise', undefined

        check = !->
            listeners.toPromises()

        check.must.throw Error

    it 'can create multiple promises for the same listeners', !->
        promise1 = listeners.toPromises()
        promise2 = listeners.toPromises()

        return Promise.all [promise1, promise2]
