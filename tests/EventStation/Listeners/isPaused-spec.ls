expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#isPaused()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must determine whether a listener is paused', (,) !->
        listeners.pause()

        listeners.isPaused().must.be.true()

    it 'must determine whether a listener is not paused', (,) !->
        listeners.pause()
        listeners.resume()

        listeners.isPaused().must.be.false()
