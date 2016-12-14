expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#isAttachedTo()', (,) !->

    station = undefined
    station2 = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        station2 := new EventStation()
        listeners := station.makeListeners 'pow boom bash', !->

    it 'must determine that the listeners are not attached to any station', (,) !->
        listeners.isAttachedTo().must.be.false()

    it 'must determine that the listeners are not attached to the origin station', (,) !->
        listeners.isAttachedTo station .must.be.false()

    it 'must determine that the listeners are not attached to an unrelated station', (,) !->
        listeners.isAttachedTo station2 .must.be.false()

    it 'must determine that the listeners are attached to specifc station after they are added to a station', (,) !->
        listeners.addTo station2

        listeners.isAttachedTo station2 .must.be.true()

    it 'must determine that the listeners are attached to any station', (,) !->
        listeners.addTo station2

        listeners.isAttachedTo().must.be.true()

    it 'must determine that the listeners are not attached to any station after they are removed', (,) !->
        listeners.addTo station2
        listeners.off()

        listeners.isAttachedTo().must.be.false()
