expect = require 'must'
EventStation = require 'event-station'

describe 'EventStation.prototype.emit()', ->
    do ->
        station = new EventStation
        applied = 0

        station.on 'all', () ->
            applied++;

        it 'must apply the callback twice', ->
            station.emit ['pow', 'woosh']
            applied.must.equal(2)

    do ->
        station = new EventStation
        applied = 0

        callback = (three) ->

            applied++
            context = this

            it 'must call the callback with `3` as the first argument', ->
                expect(three).to.be.undefined()
                three.must.equal 3

            it 'must set the context with `foo` as a property of `this`', ->
                expect(context).to.not.be.undefined()
                expect(context.foo).to.equal 'bar'

        station.on 'bam', callback, { foo: 'bar' }

        it 'must apply the listener once', ->
            station.emit 'bam', 3
            applied.must.equal 1

    do ->
        station = new EventStation
        applied = 0

        station.on 'boom', (bang, pow) ->

            applied++

            it 'must call the callback with "bang" as the first argument', ->
                bang.must.equal 'bang'
            it 'must call the callback with "pow" as the second argument', ->
                pow.must.equal 'pow'

        it 'must apply the callback once', ->
            station.emit 'boom', 'bang', 'pow'
            applied.must.equal 1

        it 'must apply the callback twice', ->
            station.emit 'boom', 'bang', 'pow'
            applied.must.equal 2

    do ->
        station = new EventStation

        station.on 'boom', (bang, pow, bash) ->

            it 'must call the callback with "bang" as the first argument', ->
                bang.must.equal 'bang'
            it 'must call the callback with "pow" as the second argument', ->
                pow.must.equal 'pow'
            it 'must call the callback with "bash" as the third argument', ->
                bash.must.equal 'bash'

        station.emit 'boom', 'bang', 'pow', 'bash'

    do ->
        station = new EventStation

        station.on 'boom', (bang, pow, bash, Kablammo) ->

            it 'must call the callback with "bang" as the first argument', ->
                bang.must.equal 'bang'
            it 'must call the callback with "pow" as the second argument', ->
                pow.must.equal 'pow'
            it 'must call the callback with "bash" as the third argument', ->
                bash.must.equal 'bash'
            it 'must call the callback with "kablammo" as the fourth argument', ->
                Kablammo.must.equal 'kablammo'

        station.emit 'boom', 'bang', 'pow', 'bash', 'kablammo'

    do ->
        station = new EventStation
        applied = 0
        callback = () ->
            applied++;
        station.on 'pow', callback
        station.on 'woosh', callback

        it 'must apply the listener twice', ->
            station.emit ['pow', 'woosh']
            applied.must.equal(2)

        it 'must apply the listener four times', ->
            station.emit 'pow woosh'
            applied.must.equal(4)

    do ->
        station = new EventStation enableRegExp: true
        applied = 0
        callback = () ->
            applied++;
        station.on '%^foo/bar/[^/]+$', callback

        it 'must process the regex listener', ->
            station.emit 'foo/bar/1'
            applied.must.equal 1
            station.emit 'foo/bar/2'
            applied.must.equal 2
            station.emit 'foo/bar'
            applied.must.equal 2
            station.off()
            station.listenerCount.must.equal 0
            station.on '%^foo/[^/]+/1$ foo/bar/2', callback
            station.listenerCount.must.equal 2
            station.emit 'foo/bar/1'
            applied.must.equal 3
            station.emit 'foo/bar/2'
            applied.must.equal 4
            station.emit 'foo/bar/3'
            applied.must.equal 4

    do ->
        station = new EventStation
        station.on 'boom'
        it 'must throw an error when an invalid argument is given', ->
            (() ->
                station.emit()
            ).must.throw(Error)