

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import EventStation from "../../src/main";
  describe('EventStation#makeListeners()', function(){
    let station;
    station = undefined;
    beforeEach(function(){
      station = new EventStation;
    });
    it('must create listeners without attaching it', function(){
      let listeners;
      listeners = station.makeListeners('boom pow', function(){});
      expect(listeners.listeners.length).toBe(2);
    });
    it('must not attach the listeners', function(){
      let listeners;
      listeners = station.makeListeners('boom', function(){});
      expect(station.listenerCount).toBe(0);
    });
  });

