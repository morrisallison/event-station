/* global it */
/* global describe */
var expect = require('must');
var EventStation = require('event-station');

describe('An extended JavaScript class', function () {

    function Martian () { EventStation.init(this); }
    EventStation.extend(Martian.prototype);
    var alien = new Martian;

    it('must have all the required properties', function () {

        alien.must.have.ownProperty('stationMeta');
        Martian.prototype.must.have.ownProperty('stationId');
        Martian.prototype.must.have.ownProperty('listenerCount');
        Martian.prototype.must.have.ownProperty('hearingCount');
        Martian.prototype.must.have.ownProperty('listenerEventNames');
        Martian.prototype.must.have.ownProperty('on');
        Martian.prototype.must.have.ownProperty('once');
        Martian.prototype.must.have.ownProperty('off');
        Martian.prototype.must.have.ownProperty('hear');
        Martian.prototype.must.have.ownProperty('hearOnce');
        Martian.prototype.must.have.ownProperty('disregard');
        Martian.prototype.must.have.ownProperty('isHeard');
        Martian.prototype.must.have.ownProperty('isHearing');
        Martian.prototype.must.have.ownProperty('emit');
        Martian.prototype.must.have.ownProperty('makeListeners');
        Martian.prototype.must.have.ownProperty('getListeners');
        Martian.prototype.must.have.ownProperty('toObservable');
        Martian.prototype.must.have.ownProperty('stopPropagation');
        Martian.prototype.must.have.ownProperty('addListener');
        Martian.prototype.must.have.ownProperty('removeListener');
        Martian.prototype.must.have.ownProperty('hasListener');
    });

    it('must work as an EventStation instance', function () {

        var earthlingGreeted = false;
        var earthling = new EventStation();

        alien.hear(earthling, 'greet', function () {
            earthlingGreeted = true;
        });

        alien.isHearing(earthling).must.be.true();

        earthling.emit('greet');

        earthlingGreeted.must.be.true();
    });
});