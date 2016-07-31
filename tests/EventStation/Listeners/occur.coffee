expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.occur()', ->

    child = new EventStation
    parent = new EventStation

    timesApplied = 0

    listeners = parent.hear child, 'whine', ()->
        timesApplied++

    child.listenerCount.must.equal 1

    it 'must throw an error', ->
        (() ->
            listeners.occur 0
        ).must.throw Error

    it 'must restrict the listener to three applications', ->
        listeners.occur 3

        timesApplied.must.equal 0
        child.emit('whine')
        timesApplied.must.equal 1
        child.emit('whine')
        timesApplied.must.equal 2
        child.emit('whine')
        timesApplied.must.equal 3
        child.emit('whine')
        timesApplied.must.equal 3

    it 'must remove the listener from the station', ->
        child.listenerCount.must.equal 0

    it 'must remove the listener from both stations', ->

        listeners = child.once 'boom', ->
        child.listenerCount.must.equal 1
        listeners.addTo parent
        child.listenerCount.must.equal 1

        child.emit 'boom'
        child.listenerCount.must.equal 0
        parent.listenerCount.must.equal 0