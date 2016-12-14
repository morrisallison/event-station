expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation#makeListeners()', (,) !->

    station = undefined

    beforeEach !->
        station := new EventStation

    it 'must create listeners without attaching it', (,) !->
        listeners = station.makeListeners 'boom pow', ->

        listeners.listeners.length.must.equal 2

    it 'must not attach the listeners', (,) !->
        listeners = station.makeListeners 'boom', ->

        station.listenerCount.must.equal 0
