expect = require 'must'
EventStation = require 'event-station'

describe 'An extended object literal', ->

    Wonderfuls = EventStation.extend {}
    EventStation.init Wonderfuls

    it 'must work as an EventStation instance', ->

        wonderfulsHeardSinging = false;
        WonderGirls = new EventStation()
        Wonderfuls.hear WonderGirls, 'sing', () ->
            wonderfulsHeardSinging = true
        Wonderfuls.isHearing(WonderGirls).must.be.true()
        WonderGirls.emit 'sing'
        wonderfulsHeardSinging.must.be.true()