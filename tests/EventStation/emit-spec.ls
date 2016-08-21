expect = require 'must'
EventStation = require '../../src/EventStation' .EventStation

describe 'EventStation#emit()', (,) !->
    station = undefined

    beforeEach !->
        station := new EventStation

    it 'must apply the listener once', (,) !->
        applied = 0
        station.on 'bam', !->
            applied++

        station.emit 'bam'

        applied.must.equal 1

    it 'must emit three events delimited by spaces', (,) !->
        applied = 0
        station.on 'all', !->
            applied++

        station.emit 'its over 9000'

        applied.must.equal 3

    it 'must emit one event with spaces when the delimiter is disabled', (,) !->
        applied = 0
        station.stationMeta.enableDelimiter = false
        station.on 'its over 9000', !->
            applied++

        station.emit 'its over 9000'

        applied.must.equal 1

    it 'must apply the callback twice', (,) !->
        applied = 0
        station.on 'all', !->
            applied++

        station.emit ['pow', 'woosh']

        applied.must.equal 2

    it 'must call the callback with `3` as the first argument', (,) !->
        arg = undefined
        station.on 'boom', (value) !->
            arg := value

        station.emit 'boom', 3

        arg.must.equal 3

    it 'must set the context with `foo` as a property of `this`', (,) !->
        context = undefined
        callback = ->
            context := this

        station.on 'bam', callback, { foo: 'bar' }

        station.emit 'bam'

        expect(context.foo).to.equal 'bar'

    it 'must throw an error when an invalid argument is given', (,) !->
        station.on 'bam'
        check = !->
            station.emit()

        check.must.throw Error

    it 'must increase listener occurrences when a limit is set', (,) !->
        listeners = station.on 'bam'
        listeners.occur 3
        listener = listeners.get 0

        expect(listener.occurrences).must.be.undefined()

        station.emit 'bam'

        listener.occurrences.must.equal 1

describe 'EventStation#emit()', (,) !->

    station = undefined
    bang = undefined
    pow = undefined
    bash = undefined
    Kablammo = undefined

    beforeEach !->
        station := new EventStation
        station.on 'boom', !->
            bang := arguments[0]
            pow := arguments[1]
            bash := arguments[2]
            Kablammo := arguments[3]

    it 'must call the callback with "bang" as the first argument', (,) !->
        station.emit 'boom', 'bang'

        bang.must.equal 'bang'

    it 'must call the callback with "pow" as the second argument', (,) !->
        station.emit 'boom', 'bang', 'pow'

        pow.must.equal 'pow'

    it 'must call the callback with "bash" as the third argument', (,) !->
        station.emit 'boom', 'bang', 'pow', 'bash'

        bash.must.equal 'bash'

    it 'must call the callback with "kablammo" as the fourth argument', (,) !->
        station.emit 'boom', 'bang', 'pow', 'bash', 'kablammo'

        Kablammo.must.equal 'kablammo'

describe 'EventStation#emit()', (,) !->

    applied = undefined
    callback = undefined
    station = undefined

    beforeEach !->
        station := new EventStation enableRegExp: true
        applied := 0
        callback := ->
            applied++

    it 'must emit an event that matches the listener', (,) !->
        station.on '%^foo/bar/[^/]+$', callback

        applied.must.equal 0

        station.emit 'foo/bar/1'

        applied.must.equal 1

    it 'must emit an event that doesn\'t match the listener', (,) !->
        station.on '%^foo/bar/[^/]+$', callback

        applied.must.equal 0

        station.emit 'foo/bar'

        applied.must.equal 0

    it 'must emit an event that both regex listeners', (,) !->
        station.on '%^foo/[^/]+/1$ foo/bar/2', callback

        applied.must.equal 0

        station.emit 'foo/bar/1'

        applied.must.equal 1

    it 'must emit an event that matches a string listener', (,) !->
        station.on '%^foo/[^/]+/1$ foo/bar/2', callback

        applied.must.equal 0

        station.emit 'foo/bar/2'

        applied.must.equal 1

    it 'must emit an event that matches neither string nor regex listeners', (,) !->
        station.on '%^foo/[^/]+/1$ foo/bar/2', callback

        applied.must.equal 0

        station.emit 'foo/bar/3'

        applied.must.equal 0

    it 'must work with custom regex listener markers', (,) !->
        station.stationMeta.regExpMarker = 'REGEX'
        station.on 'REGEX^foo/bar/[^/]+$', callback

        applied.must.equal 0

        station.emit 'foo/bar/1'

        applied.must.equal 1
