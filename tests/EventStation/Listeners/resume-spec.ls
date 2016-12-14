expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#resume()', (,) !->

    station = undefined
    listeners = undefined
    timesApplied = undefined

    beforeEach !->
        station := new EventStation
        timesApplied := 0
        listeners := station.on 'boom', !->
            timesApplied++
        listeners.pause()

    it 'must un-pause the listeners', (,) !->
        listeners.isPaused().must.be.true()

        listeners.resume()

        listeners.isPaused().must.be.false()

    it 'allow the listeners to be applied', (,) !->
        station.emit 'boom'

        timesApplied.must.equal 0

        listeners.resume()
        station.emit 'boom'

        timesApplied.must.equal 1