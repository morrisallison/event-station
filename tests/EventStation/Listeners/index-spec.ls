expect = require 'must'
EventStation = require '../../../src/main' .default

describe 'Listeners#index()', (,) !->

    station = undefined
    listeners = undefined

    beforeEach !->
        station := new EventStation()
        listeners := station.on 'pow boom bash', !->

    it 'must retrieve the index of the given listener', (,) !->
        listener = listeners.get 1
        listeners.index listener .must.equal 1

    it 'must return `undefined` when the given listener isn\'t found', (,) !->
        listener = listeners.index {}
        expect listener .to.be.undefined()
