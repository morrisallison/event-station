expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.inject()', ->

    it 'must throw an error when an invalid name is given', ->
        (() ->
            EventStation.inject('foobar', {})
        ).must.throw Error