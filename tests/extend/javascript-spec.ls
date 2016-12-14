EventStation = require '../../src/main' .default
expect = require 'must'

properties = [
    'addListener',
    'disregard',
    'emit',
    'getListeners',
    'hasListener',
    'hear',
    'hearingCount',
    'hearOnce',
    'isHeard',
    'isHearing',
    'listenerCount',
    'listenerEventNames',
    'makeListeners',
    'off',
    'on',
    'once',
    'removeListener',
    'stationId',
    'stopPropagation',
    'toObservable',
]

describe 'EventStation.extend', (,) !->
    Martian = undefined

    before !->
        ``
        function MartianConstructor() {
            EventStation.init(this);
        }
        ``

        EventStation.extend MartianConstructor.prototype

        Martian := MartianConstructor

    describe 'An extended prototype', (,) !->
        check = (property) !->
            Martian.prototype.must.have.ownProperty property

        for property in properties
            test = check.bind null, property
            it "must have a property named \"#property\"", test

    it 'must work as an EventStation instance', (,) !->
        alien = new Martian()
        earthling = new EventStation()
        earthlingGreeted = false

        alien.hear earthling, 'greet', (,) !->
            earthlingGreeted := true

        earthling.emit 'greet'

        earthlingGreeted.must.be.true()
