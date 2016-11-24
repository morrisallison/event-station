expect = require 'must'
Promise = require 'bluebird'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#emitAsync()', (,) !->
    allDone = undefined
    boomDone = undefined
    powDone = undefined
    station = undefined
    totalEvents = undefined

    beforeEach !->
        EventStation.inject 'Promise', Promise

        station := new EventStation
        boomDone := 0
        powDone := 0
        allDone := 0
        totalEvents := 0

    afterEach !->
        EventStation.reset()

    it 'must return a promise that is resolves to an array when the station has no attached listeners', (,) !->
        promise = station.emitAsync 'boom'

        return promise.must.then.eql([])

    it 'must return a promise that is resolved when no listeners return promises', (,) !->
        station.on 'pow', !->
            powDone++
        station.on 'boom', !->
            boomDone++

        powDone.must.equal 0
        boomDone.must.equal 0

        return station.emitAsync(['pow', 'boom']).then !->
            powDone.must.equal 1
            boomDone.must.equal 1

    it 'must return a promise that resolves after all listeners have finished', (,) !->
        station.on 'pow', !->
        station.on 'boom', !->
            return new Promise (resolve) !->
                op = !->
                    boomDone++
                    resolve()

                setTimeout op, 0

        promise = station.emitAsync(['pow', 'boom']).then !->
            boomDone.must.equal 1

        boomDone.must.equal 0

        return promise

    it 'must not delay synchronous listeners', (,) !->
        station.on 'pow', !->
            powDone++

        station.on 'boom', !->
            return new Promise (resolve) !->
                setTimeout resolve, 0

        promise = station.emitAsync(['pow', 'boom'])

        powDone.must.equal 1

        return promise

    it 'must throw an error when a promise object is NOT available', !->
        EventStation.inject 'Promise', undefined
        promiseCallback = -> Promise.resolve()
        station.on 'pow', promiseCallback
        station.on 'boom', promiseCallback
        check = !->
            station.emitAsync ['pow', 'boom']

        check.must.throw Error

    it 'must emit four events to three listeners while passing arguments and returning a promise', (,) !->
        station.on 'all', (eventName, bash, bam, smash) !->
            expect(eventName == 'pow' || eventName == 'boom').to.be.true()
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'

            return new Promise (resolve) !->
                allDone++
                totalEvents++
                resolve()

        station.on 'pow', (bash, bam, smash) !->
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'

            return new Promise (resolve) !->
                powDone++
                totalEvents++
                resolve()

        station.on 'boom', (bash, bam, smash) !->
            bash.must.equal 'bash'
            bam.must.equal 'bam'
            smash.must.equal 'smash'

            return new Promise (resolve) !->
                boomDone++
                totalEvents++
                resolve()

        allDone.must.equal 0
        powDone.must.equal 0
        boomDone.must.equal 0
        totalEvents.must.equal 0

        return station.emitAsync(['pow', 'boom'], 'bash', 'bam', 'smash').then !->
            allDone.must.equal 2
            powDone.must.equal 1
            boomDone.must.equal 1
            totalEvents.must.equal 4
