expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.using()', ->

    station = new EventStation
    callback = (str) ->
    date = new Date

    it "must set the context of the listeners", ->
        station.on('boom', callback).using(date)
        listener = station.stationMeta.listenersMap.boom[0]
        listener.context.must.equal date
        expect(listener.matchContext).to.equal date