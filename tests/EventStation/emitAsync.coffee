expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.emitAsync()', ->

    do ->

        station = new EventStation

        it 'must return a `Promise` that is resolved when the station has no attached listeners', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise
            result = station.emitAsync 'boom'
            result.must.be.an.instanceOf Promise
            result.then ()->
                done()
                return
    do ->

        station = new EventStation
        powDone = 0
        boomDone = 0

        station.on 'pow', () ->
            powDone++
        station.on 'boom', () ->
            boomDone++

        it 'must return a `Promise` that is resolved when no listeners return promises', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise

            station.emitAsync(['pow', 'boom']).then () ->
                powDone.must.equal 1
                boomDone.must.equal 1
                done()
                return

            powDone.must.equal 1
            boomDone.must.equal 1

    do ->

        station = new EventStation
        powDone = 0
        boomDone = 0

        station.on 'pow', () ->
            powDone++

        station.on 'boom', () ->
            return new Promise (resolve) ->
                setTimeout (()->
                    boomDone++
                    resolve()
                ), 0
                return

        it 'must return a `Promise` that resolves after all listeners have finished', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise

            station.emitAsync(['pow', 'boom']).then ()->
                powDone.must.equal 1
                boomDone.must.equal 1
                done()
                return

            powDone.must.equal 1
            boomDone.must.equal 0

    do ->

        station = new EventStation

        station.on 'pow', () ->
            return Promise.resolve();
        station.on 'boom', () ->
            return Promise.resolve();

        it 'must throw an error when a `Promise` object is NOT available', () ->

            # Ensure that a Promise object is NOT available for the test
            EventStation.inject 'Promise', undefined

            (()->
                station.emitAsync(['pow', 'boom'])
            ).must.throw Error

    do ->
        station = new EventStation
        allDone = 0
        powDone = 0
        boomDone = 0
        totalEvents = 0

        station.on 'all', (eventName, bash, bam, smash) ->
            expect(eventName == 'pow' || eventName == 'boom').to.be.true()
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'
            return new Promise (resolve)->
                setTimeout ()->
                    allDone++
                    totalEvents++
                    resolve()
                , 0
                return

        station.on 'pow', (bash, bam, smash) ->
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'
            return new Promise (resolve)->
                setTimeout ()->
                    powDone++
                    totalEvents++
                    resolve()
                , 0
                return

        station.on 'boom', (bash, bam, smash) ->
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'
            return new Promise (resolve)->
                setTimeout ()->
                    boomDone++
                    totalEvents++
                    resolve()
                , 0
                return

        it 'must emit four events to three listeners while passing arguments and returning a promise', (done) ->

            # Ensure that a Promise object is available for the test
            EventStation.inject 'Promise', global.Promise

            station.emitAsync(['pow', 'boom'], 'bash', 'bam', 'smash').then ()->
                allDone.must.equal 2
                powDone.must.equal 1
                boomDone.must.equal 1
                totalEvents.must.equal 4
                done()
                return

            allDone.must.equal 0
            powDone.must.equal 0
            boomDone.must.equal 0