

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import { EventStation } from "../../src/main";
  describe('EventStation#hasListener()', function(){
    let station, stationMeta, listenerClone, callback, context;
    station = undefined;
    stationMeta = undefined;
    listenerClone = undefined;
    callback = undefined;
    context = undefined;
    beforeEach(function(){
      let listeners;
      station = new EventStation;
      stationMeta = station.stationMeta;
      callback = function(){};
      context = new Date;
      listeners = station.on('boom', callback, context);
      listenerClone = {
        eventName: 'boom',
        callback: callback,
        context: context
      };
    });
    it('must determine that the listener has been attached by only giving an event name', function(){
      let matchingListener;
      matchingListener = {
        eventName: 'boom'
      };
      expect(station.hasListener(matchingListener)).toBe(true);
    });
    it('must determine that the listener hasn\'t been attached by only giving an event name', function(){
      let matchingListener;
      matchingListener = {
        eventName: 'pow'
      };
      expect(station.hasListener(matchingListener)).toBe(false);
    });
    it('must determine that the listener hasn\'t been attached by giving a different context', function(){
      let matchingListener;
      matchingListener = {
        eventName: 'boom',
        matchContext: new Date
      };
      expect(station.hasListener(matchingListener)).toBe(false);
    });
    it('must determine that the listener has been attached by giving a matching listener', function(){
      expect(station.hasListener(listenerClone)).toBe(true);
    });
    it('must determine that the listener hasn\'t been attached by setting the exact match flag', function(){
      expect(station.hasListener(listenerClone, true)).toBe(false);
    });
  });

