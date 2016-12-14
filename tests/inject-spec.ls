expect = require 'must'
EventStation = require '../src/main' .default

describe 'EventStation.inject()', (,) !->

    it 'must throw an error when an invalid name is given', (,) !->
        check = !->
            EventStation.inject('foobar', {})

        check.must.throw Error
