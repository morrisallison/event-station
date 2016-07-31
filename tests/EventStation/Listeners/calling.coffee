expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.calling()', ->

    station = new EventStation
    callback = (str) ->

    it "must set the callback of the listeners", ->
        station.on('boom').calling(callback)
        listener = station.stationMeta.listenersMap.boom[0]
        listener.callback.must.equal callback
        expect(listener.matchCallback).to.equal callback