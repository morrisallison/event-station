expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.isPaused()', ->
    station = new EventStation
    listener = station.on 'boom', (str) ->

    it 'must determine whether the listener has been paused', ->
        listener.pause()
        listener.isPaused().must.be.true()
        listener.resume()
        listener.isPaused().must.be.false()