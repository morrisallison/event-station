expect = require 'must'
EventStation = require 'event-station'

describe 'My imagination (>.<)', ->

    JusticeLeague = (str) ->

    describe 'When Superman called the Justice League', ->

        Batman = new EventStation
        Superman = new EventStation
        Batman.hear Superman, 'call', JusticeLeague

        stationMeta = Superman.stationMeta
        Superman.listenerCount.must.equal 1

        it 'Batman disregarded him', ->
            # oh no he didn't
            Batman.disregard Superman
            Superman.listenerCount.must.equal 0
            Superman.isHeard().must.be.false()
            expect(stationMeta.listenersMap['call']).to.be.undefined()

    describe 'When Superman called the Justice League the second time', ->

        Batman = new EventStation
        Superman = new EventStation
        emergencyCall = '0111000001100001011100110111001101110111011011110111001001100100';
        Batman.hear Superman, emergencyCall, JusticeLeague

        stationMeta = Superman.stationMeta
        Superman.listenerCount.must.equal 1

        it ', Batman tried to ignore it, but Superman used the emergency protocol and forced the call through', ->
            Batman.disregard Superman, 'call', JusticeLeague
            Superman.listenerCount.must.equal 1
            expect(stationMeta.listenersMap[emergencyCall]).to.be.an.array()

        it ', Batman answered while yelling "No, I will not attend Lois\'s birthday as Bruce!" then hung up', ->
            # I'M BATMAN
            Batman.disregard Superman, emergencyCall, JusticeLeague
            Superman.listenerCount.must.equal 0
            expect(stationMeta.listenersMap[emergencyCall]).to.be.undefined()

    describe 'The Hulk\'s attacks', ->

        hulkAttacks =
            smash: () ->
            smashHard: () ->
            smashHarder: () ->

        Ironman = new EventStation
        Hulk = new EventStation

        Ironman.hear Hulk, hulkAttacks
        stationMeta = Hulk.stationMeta
        Hulk.listenerCount.must.equal 3

        it 'don\'t phase Ironman', ->
            Ironman.disregard Hulk, hulkAttacks
            Hulk.listenerCount.must.equal 0
            expect(stationMeta.listenersMap['smash']).to.be.undefined()

    describe 'Vegeta, what does the scouter say about his power level?', ->

        powerLevel = ['it\'s', 'over', '9000']

        Nappa = new EventStation
        Vegeta = new EventStation

        Nappa.hear Vegeta, powerLevel, () ->
        Vegeta.listenerCount.must.equal 3

        it 'It\'s over 9000!!!', ->
            # WHAT 9000?!
            Nappa.disregard Vegeta, powerLevel
            Vegeta.listenerCount.must.equal 0
            expect(Vegeta.stationMeta.listenersMap['over']).to.be.undefined()

# Maybe I should go to bed now...