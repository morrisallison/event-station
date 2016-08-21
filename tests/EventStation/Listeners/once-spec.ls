expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'EventStation#once()', (,) !->

    car = undefined
    listeners = undefined
    timeDriven = undefined

    beforeEach !->
        car := new EventStation
        listeners := car.on 'drive', !->
        timeDriven := 0

        car.on 'drive' .once !->
            timeDriven++

    it 'must restrict the listener to one application', (,) !->
        timeDriven.must.equal 0

        car.emit 'drive'
        car.emit 'drive'

        timeDriven.must.equal 1
