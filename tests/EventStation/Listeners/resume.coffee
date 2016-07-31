expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.resume()', ->

    station = new EventStation
    numApplied = 0
    callback = (str) ->
        numApplied++
    listeners = station.on 'boom', callback
    listeners.pause()
    station.emit 'boom'
    numApplied.must.equal 0

    it 'must un-pause the listeners', ->
        listeners.resume()
        station.emit 'boom'
        numApplied.must.equal 1