expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#getListeners()', (,) !->

    station = undefined
    callback = undefined
    context = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation
        callback := ->
        context := new Date
        listeners := station.on 'pow boom bash', callback, context

    it 'must return undefined if no listeners are attached to the station', (,) !->
        listeners.off()

        expect station.getListeners() .to.be.undefined()

    it 'must retrieve all of the listeners that are attached to the station', (,) !->
        listeners.forEach (listener) !->
            station.getListeners().has listener, true

    it 'must a listeners object with the same count as the the station\'s listener count', (,) !->
        station.getListeners().count.must.equal station.listenerCount

    it 'must retrieve attached listeners that match a specific event', (,) !->
        station.getListeners 'boom' .count.must.equal 1

    it 'must retrieve attached listeners that match a listener map', (,) !->
        station.getListeners { 'pow': callback } .count.must.equal 1

    it 'must retrieve attached listeners that match an array of events', (,) !->
        station.getListeners ['bash', 'pow'] .count.must.equal 2

    it 'must return `undefined` if no matching listeners are found', (,) !->
        expect station.getListeners('smash') .to.be.undefined()
