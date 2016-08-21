expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#clone()', (,) !->

    callback = undefined
    clones = undefined
    context = undefined
    listeners = undefined
    station = undefined
    station2 = undefined

    beforeEach !->
        station := new EventStation()
        station2 := new EventStation()
        context := new Date()
        callback := ->
        listeners := station.on 'boom pow bam', callback, context

    it 'must return a new `Listeners` object', (,) !->
        clones := listeners.clone()

        clones.must.not.equal listeners

    it 'must create new listeners', (,) !->
        clones := listeners.clone()

        listener = listeners.get 0
        clone = clones.get 0

        clone.must.not.equal listener

    it 'must copy the listener\'s event name', (,) !->
        clones := listeners.clone()

        listener = listeners.get 1
        clone = clones.get 1

        expect clone.eventName .to.equal listener.eventName

    it 'must copy the listener\'s callback', (,) !->
        clones := listeners.clone()

        listener = listeners.get 2
        clone = clones.get 2

        expect clone.callback .to.equal listener.callback

    it 'must copy the listener\'s context', (,) !->
        clones := listeners.clone()

        listener = listeners.get 0
        clone = clones.get 0

        expect clone.context .to.equal listener.context

    it 'must copy the listener\'s matching callback', (,) !->
        clones := listeners.clone()

        listener = listeners.get 1
        clone = clones.get 1

        expect clone.matchCallback .to.equal listener.matchCallback

    it 'must copy the listener\'s matching context', (,) !->
        clones := listeners.clone()

        listener = listeners.get 2
        clone = clones.get 2

        expect clone.matchContext .to.equal listener.matchContext

    it 'must copy the listener\'s paused state', (,) !->
        clones := listeners.clone()

        listener = listeners.get 0
        clone = clones.get 0

        expect clone.isPaused .to.equal listener.isPaused

    it 'must copy the listener\'s number of occurrences', (,) !->
        clones := listeners.clone()

        listener = listeners.get 1
        clone = clones.get 1

        expect clone.occurrences .to.equal listener.occurrences

    it 'must copy the listener\'s occurrence limit', (,) !->
        clones := listeners.clone()

        listener = listeners.get 2
        clone = clones.get 2

        expect clone.maxOccurrences .to.equal listener.maxOccurrences

    it 'must clone the same number of listeners', (,) !->
        clones := listeners.clone()

        clones.count.must.equal 3

    it 'must assign an origin station', (,) !->
        expect clones.originStation .to.be.an.object()

    it 'must throw an error when cloning cross-emitter listeners', (,) !->
        listeners = station.hear station2, 'bash', callback, context

        check = !->
            listeners.clone()

        check.must.throw Error
