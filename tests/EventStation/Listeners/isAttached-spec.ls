expect = require 'must'
EventStation = require '../../../src/EventStation' .EventStation

describe 'Listeners#isAttached()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must determine that the listeners are attached', (,) !->
        listeners.isAttached().must.be.true()

    it 'must determine that the listeners aren\'t attached', (,) !->
        listeners.off()

        listeners.isAttached().must.be.false()
