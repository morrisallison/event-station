expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#forEach()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must provide an array to the callback', (,) !->
        listeners.forEach (listener, index, arr) !->
            arr.must.be.an.array()

    it 'must apply the callback for each listener', (,) !->
        called = 0
        listeners.forEach (listener, index, arr) !->
            called++

        called.must.equal 3

    it 'must provide the listener\'s index', (,) !->
        listeners.forEach (listener, index, arr) !->
            listeners.get index .must.equal listener
