expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#reset()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'boom', !->
        listeners.occur 3
        station.emit 'boom'
        listeners.pause()

    it 'must clear the occurrences', (,) !->
        listeners.reset()
        listener = listeners.get 0

        expect listener.occurrences .to.be.undefined()

    it 'must clear the paused state', (,) !->
        listeners.reset()
        listener = listeners.get 0

        expect listener.isPaused .to.be.undefined()
