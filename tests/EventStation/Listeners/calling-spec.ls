expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#calling()', (,) !->

    station = undefined
    callback = undefined

    beforeEach !->
        station := new EventStation
        callback := !->

    it "must set the callback of the listeners", !->
        station.on 'boom' .calling callback
        listener = station.stationMeta.listenersMap.boom[0]

        expect listener.callback .to.equal callback

    it "must set the matching callback of the listeners", !->
        station.on 'boom' .calling callback
        listener = station.stationMeta.listenersMap.boom[0]

        expect listener.matchCallback .to.equal callback
