expect = require 'must'
EventStation = require 'event-station'

describe 'Listeners.prototype.toPromises()', ->

    station = new EventStation
    listeners = station.on 'boom', () ->

    it 'must throw an error if promises are not available', () ->

        EventStation.inject 'Promise', undefined

        (() ->
            listeners.toPromises()
        ).must.throw(Error)

        EventStation.inject 'Promise', global.Promise