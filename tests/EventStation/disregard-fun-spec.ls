expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'My imagination (>.<)', (,) !->

    JusticeLeague = undefined

    before !->
        JusticeLeague := (str) !->

    describe 'When Superman called the Justice League', (,) !->

        Batman = undefined
        Superman = undefined
        stationMeta = undefined

        before !->
            Batman := new EventStation()
            Superman := new EventStation()
            stationMeta := Superman.stationMeta

            Batman.hear Superman, 'call', JusticeLeague

        it 'Batman disregarded him', (,) !->
            # oh no he didn't
            Batman.disregard Superman

            Superman.isHeard().must.be.false()

    describe 'When Superman called the Justice League the second time', (,) !->

        Batman = undefined
        Superman = undefined
        emergencyCall = undefined
        stationMeta = undefined

        before !->
            Batman := new EventStation()
            Superman := new EventStation()
            emergencyCall := '0111000001100001011100110111001101110111011011110111001001100100';
            stationMeta := Superman.stationMeta

        it ', Batman tried to ignore it, but Superman used the emergency protocol and forced the call through', (,) !->
            Batman.disregard Superman, 'call', JusticeLeague
            Batman.hear Superman, emergencyCall, JusticeLeague

            Superman.isHeard().must.be.true()

        it ', Batman answered while yelling "No, I will not attend Lois\'s birthday as Bruce!" then hung up', (,) !->
            # I'M BATMAN
            Batman.disregard Superman, emergencyCall, JusticeLeague

            Superman.listenerCount.must.equal 0

    describe 'The Hulk\'s attacks', (,) !->

        hulkAttacks = undefined
        Ironman = undefined
        Hulk = undefined
        stationMeta = undefined

        before !->
            hulkAttacks :=
                smash: !->
                smashHard: !->
                smashHarder: !->

            Ironman := new EventStation()
            Hulk := new EventStation()
            stationMeta := Hulk.stationMeta

            Ironman.hear Hulk, hulkAttacks

        it 'don\'t phase Ironman', (,) !->
            Ironman.disregard Hulk, hulkAttacks

            Hulk.isHeard().must.be.false()

    describe 'Vegeta, what does the scouter say about his power level?', (,) !->

        powerLevel = undefined
        Nappa = undefined
        Vegeta = undefined

        before !->
            powerLevel := ['it\'s', 'over', '9000']
            Nappa := new EventStation()
            Vegeta := new EventStation()

            Nappa.hear Vegeta, powerLevel, !->

        it 'It\'s over 9000!!!', (,) !->
            # WHAT 9000?!
            Nappa.disregard Vegeta, powerLevel

            expect(Vegeta.getListeners()).to.not.exist()

# Maybe I should go to bed now...
