

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import EventStation from "../../src/main";
  describe('EventStation#off()', function(){
    let station, station2, stationMeta, callback, context;
    station = undefined;
    station2 = undefined;
    stationMeta = undefined;
    callback = undefined;
    context = undefined;
    beforeEach(function(){
      station = new EventStation;
      station2 = new EventStation;
      stationMeta = station.stationMeta;
      callback = function(){};
      context = new Date();
    });
    it('must do nothing if no listeners are attached', function(){
      let result;
      result = station.off();
      expect(station.listenerCount).toBe(0);
    });
    it('must remove multiple listeners', function(){
      station.on('boom', callback);
      station.on('boom', callback);
      expect(station.listenerCount).toBe(2);
      station.off('boom');
      expect(station.listenerCount).toBe(0);
    });
    it('must remove a listener matching the given parameters', function(){
      station.on('boom', callback);
      station.on('boom', function(){});
      expect(station.listenerCount).toBe(2);
      station.off('boom', callback);
      expect(station.listenerCount).toBe(1);
    });
    it('must do nothing if no listeners are listening to an event', function(){
      station.on('boom');
      expect(station.listenerCount).toBe(1);
      station.off('pow');
      expect(station.listenerCount).toBe(1);
    });
    it('must reduce the hearingCount when removing listeners for a specific event', function(){
      station.hear(station2, 'bang', function(){});
      station.hear(station2, 'pow', function(){});
      expect(station.hearingCount).toBe(2);
      station2.off('bang');
      expect(station.hearingCount).toBe(1);
    });
    it('must remove all listeners when no arguments are given', function(){
      station.on('bang');
      station.on('pow');
      expect(station.listenerCount).toBe(2);
      station.off();
      expect(station.listenerCount).toBe(0);
    });
    it('must reduce the hearingCount when removing all listeners', function(){
      station.hear(station2, 'bang', function(){});
      station.hear(station2, 'pow', function(){});
      expect(station.hearingCount).toBe(2);
      station2.off();
      expect(station.hearingCount).toBe(0);
    });
    it('must remove multiple listeners for specific events', function(){
      station.on('pow', callback);
      station.on('pow', callback);
      station.on('boom', callback);
      station.on('boom', callback);
      expect(station.listenerCount).toBe(4);
      station.off('boom', callback);
      expect(station.listenerCount).toBe(2);
    });
    it('must match listeners based on their context', function(){
      station.on('boom', callback, context);
      expect(station.listenerCount).toBe(1);
      station.off('boom', callback, new Date);
      expect(station.listenerCount).toBe(1);
    });
    it('must remove the attached listener matching the given context', function(){
      station.on('boom', callback, context);
      expect(station.listenerCount).toBe(1);
      station.off('boom', callback, context);
      expect(station.listenerCount).toBe(0);
    });
    it('must remove the listeners matching the given listener map', function(){
      let listenerMap;
      listenerMap = {
        pow: function(){},
        bang: function(){},
        boom: function(){}
      };
      station.on(listenerMap);
      station2.hear(station, 'bash');
      expect(station.listenerCount).toBe(4);
      station.off(listenerMap);
      expect(station.listenerCount).toBe(1);
    });
    it('must remove the listeners that match the given array of events', function(){
      station.on(['its', 'over', '9000'], function(){});
      expect(station.listenerCount).toBe(3);
      station.off(['its', 'over']);
      expect(station.listenerCount).toBe(1);
    });
  });

