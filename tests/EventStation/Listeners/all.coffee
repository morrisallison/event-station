expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.all()', ->

    do ->
        applied = 0
        promiseApplied = 0
        callback = () ->
            applied++
        station = new EventStation
        listeners = station.on 'boom pow bash', callback
        station.listenerCount.must.equal 3

        it 'make a promise that resolves when all of the listeners have been applied at least once', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise

            listeners.all().then () ->
                promiseApplied++
                applied.must.equal 4
                done()

            station.emit 'boom'

            setTimeout () ->
                applied.must.equal 1
                promiseApplied.must.equal 0
                station.emit 'boom'

                setTimeout () ->
                    applied.must.equal 2
                    promiseApplied.must.equal 0
                    station.emit 'pow'

                    setTimeout () ->
                        applied.must.equal 3
                        promiseApplied.must.equal 0
                        station.emit 'bash'
                    , 0
                , 0
            , 0

    do ->
        applied = 0
        promiseApplied = 0
        callback = () ->
            applied++
        station = new EventStation
        listeners = station.on 'boom pow bash', callback
        station.listenerCount.must.equal 3

        it 'make two promises that resolve in order', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise

            listeners.all().then () ->
                promiseApplied.must.equal 0
                promiseApplied++
                applied.must.equal 4

            listeners.all().then () ->
                promiseApplied.must.equal 1
                applied.must.equal 4
                done()

            station.emit 'boom'

            setTimeout () ->
                applied.must.equal 1
                promiseApplied.must.equal 0
                station.emit 'boom'

                setTimeout () ->
                    applied.must.equal 2
                    promiseApplied.must.equal 0
                    station.emit 'pow'

                    setTimeout () ->
                        applied.must.equal 3
                        promiseApplied.must.equal 0
                        station.emit 'bash'
                    , 0
                , 0
            , 0