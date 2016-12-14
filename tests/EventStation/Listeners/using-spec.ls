expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#using()', (,) !->

    context = undefined
    station = undefined
    listeners = undefined

    beforeEach !->
        context := new Date
        station := new EventStation
        listeners := station.makeListeners 'pow boom bash', !->

    it "must set the context of the listeners", !->
        listeners.using context

        listener = listeners.get 0

        listener.context.must.equal context

    it "must set the matching context of the listeners", !->
        listeners.using context

        listener = listeners.get 0

        listener.matchContext.must.equal context
