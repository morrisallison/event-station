expect = require 'must'
Promise = require 'bluebird'

EventStation = require '../../../src/main' .default

describe 'Listeners#race()', (,) !->

    listeners = undefined
    station = undefined

    beforeEach !->
        EventStation.inject 'Promise', Promise
        station := new EventStation
        listeners := station.on 'boom pow bash', !->

    afterEach !->
        EventStation.reset()

    it 'must throw an error if promises are not available', !->
        EventStation.inject 'Promise', undefined

        check = !->
            listeners.race()

        check.must.throw Error

    it 'make a promise that resolves as soon as one of the listeners is applied', (,) !->
        race = listeners.race()
        listener = listeners.get 0
        station.emit 'boom'

        return race.must.then.equal listener
