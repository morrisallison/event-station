

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import { EventStation } from "../../../src/main";
  describe('Listeners#reset()', function(){
    let station, listeners;
    station = undefined;
    listeners = undefined;
    beforeEach(function(){
      station = new EventStation();
      listeners = station.on('boom', function(){});
      listeners.occur(3);
      station.emit('boom');
      listeners.pause();
    });
    it('must clear the occurrences', function(){
      let listener;
      listeners.reset();
      listener = listeners.get(0);
      expect(listener.occurrences).toBeUndefined();
    });
    it('must clear the paused state', function(){
      let listener;
      listeners.reset();
      listener = listeners.get(0);
      expect(listener.isPaused).toBeUndefined();
    });
  });

