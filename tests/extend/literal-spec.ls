expect = require 'must'
EventStation = require '../../src/main' .default

describe 'EventStation', (,) !->

    listener = undefined
    Wonderfuls = undefined
    wonderfulsHeardSinging = undefined
    WonderGirls = undefined

    beforeEach !->
        WonderGirls := new EventStation
        Wonderfuls := EventStation.extend {}
        wonderfulsHeardSinging := false
        listener := !-> wonderfulsHeardSinging := true

    it 'interoperates with dynamic types', (,) !->
        EventStation.init Wonderfuls
        Wonderfuls.hear WonderGirls, 'sing', listener
        WonderGirls.emit 'sing'

        Wonderfuls.isHearing(WonderGirls).must.be.true()
        wonderfulsHeardSinging.must.be.true()
