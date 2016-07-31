expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.clone()', ->
    station = new EventStation()
    station2 = new EventStation()
    context = new Date()
    callback = () ->
    listeners = station.on 'boom pow bam', callback, context
    station.listenerCount.must.equal 3
    clonedListeners = undefined

    it 'must clone the Listeners object', ->
        clonedListeners = listeners.clone()

    it 'must clone the same number of listeners', ->
        clonedListeners.listeners.must.be.an.array()
        clonedListeners.count.must.equal 3

    it 'must not assign an origin station', ->
        expect(clonedListeners.originStation).to.be.an.object()
        
    it 'must create a clone of each listener that matches, but is not an exact match', ->
        clonedListeners.forEach (clonedListener) ->
            listeners.has(clonedListener).must.be.true()
            listeners.has(clonedListener, true).must.be.false()

    it 'must throw an error when cloning cross-emitter listeners', ->
        listeners = station.hear station2, 'bash', callback, context
        station2.listenerCount.must.equal 1
        (() ->
            listeners.clone()
        ).must.throw Error