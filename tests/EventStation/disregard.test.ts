

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import EventStation from "../../src/main";
  describe('EventStation#disregard()', function(){
    let station1, station2, station3;
    station1 = undefined;
    station2 = undefined;
    station3 = undefined;
    beforeEach(function(){
      station1 = new EventStation;
      station2 = new EventStation;
      station3 = new EventStation;
    });
    it('must not alter stations when they\'re not hearing anything', function(){
      expect(station1.hearingCount).toBe(0);
      station1.disregard();
      expect(station1.hearingCount).toBe(0);
    });
    it('must remove the listener', function(){
      station1.hear(station2, 'boom');
      expect(station1.hearingCount).toBe(1);
      station1.disregard();
      expect(station1.hearingCount).toBe(0);
    });
    it('must remove one listener', function(){
      station1.hear(station2, 'boom');
      station1.hear(station3, 'boom');
      expect(station1.hearingCount).toBe(2);
      station1.disregard([station2]);
      expect(station1.hearingCount).toBe(1);
    });
    it('must remove multiple listeners from different stations', function(){
      station1.hear(station2, 'boom');
      station1.hear(station3, 'boom');
      expect(station1.hearingCount).toBe(2);
      station1.disregard([station2, station3]);
      expect(station1.hearingCount).toBe(0);
    });
    it('must remove listeners for a specific event', function(){
      station1.hear(station2, 'boom');
      station1.hear(station2, 'pow');
      expect(station1.hearingCount).toBe(2);
      station1.disregard(station2, 'boom');
      expect(station1.hearingCount).toBe(1);
    });
    it('must remove listeners for a specific callback', function(){
      let callback;
      callback = function(){};
      station1.hear(station2, 'boom', callback);
      station1.hear(station2, 'boom', function(){});
      expect(station1.hearingCount).toBe(2);
      station1.disregard(station2, 'boom', callback);
      expect(station1.hearingCount).toBe(1);
    });
    it('must remove listeners for a specific context', function(){
      let callback, context;
      callback = function(){};
      context = new Date();
      station1.hear(station2, 'boom', callback, context);
      station1.hear(station2, 'boom', callback, new Date());
      expect(station1.hearingCount).toBe(2);
      station1.disregard(station2, 'boom', callback, context);
      expect(station1.hearingCount).toBe(1);
    });
    it('must not remove listeners that don\'t match', function(){
      let callback;
      callback = function(){};
      station1.hear(station2, 'pow', callback);
      expect(station1.hearingCount).toBe(1);
      station1.disregard(station2, 'bam', callback);
      expect(station1.hearingCount).toBe(1);
    });
    it('must accept a listener map', function(){
      let listenerMap;
      listenerMap = {
        boom: function(){},
        pow: function(){},
        bam: function(){}
      };
      station1.hear(station2, listenerMap);
      expect(station1.hearingCount).toBe(3);
      station1.disregard(station2, listenerMap);
      expect(station1.hearingCount).toBe(0);
    });
    it('must not throw an error', function(){
      let check;
      check = function(){
        station1.disregard(new Date);
      };
      expect(check).not.toThrow();
    });
    it('must throw an error', function(){
      let check;
      station1.hear(station2, 'boom');
      check = function(){
        station1.disregard(new Date);
      };
      expect(check).toThrow(Error);
    });
  });

