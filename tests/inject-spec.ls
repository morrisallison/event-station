expect = require 'must'
EventStation = require '../src/EventStation' .EventStation

describe 'EventStation.inject()', (,) !->

    it 'must throw an error when an invalid name is given', (,) !->
        check = !->
            EventStation.inject('foobar', {})

        check.must.throw Error
