expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#has()', (,) !->

    callback = undefined
    context = undefined
    listeners = undefined
    station = undefined

    beforeEach !->
        callback := ->
        context := new Date
        station := new EventStation()
        listeners := station.on 'pow boom bash', callback, context

    it 'must determine that a given listener has a matching listener', (,) !->
        listener = listeners.get 0
        listeners.has listener .must.be.true()

    it 'must determine that a given object has a matching listener', (,) !->
        listeners.has { eventName: 'boom' } .must.be.true()

    it 'must determine that a given listener has an exact match', (,) !->
        listener = listeners.get 2
        listeners.has listener, true .must.be.true()

    it 'must determine that a given object dones\'t have an exact match', (,) !->
        listeners.has { eventName: 'boom' }, true .must.be.false()
