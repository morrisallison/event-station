

  import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

  import { EventStation } from "../../src/main";
  describe('EventStation#once()', function(){
    let station, timesApplied;
    station = undefined;
    timesApplied = undefined;
    beforeEach(function(){
      station = new EventStation;
      timesApplied = 0;
    });
    it('must attach a listener to the station', function(){
      station.once('bang', function(){
        timesApplied++;
      });
      expect(station.listenerCount).toBe(1);
    });
    it('must restrict the listener to one application', function(){
      station.once('bang', function(){
        timesApplied++;
      });
      expect(timesApplied).toBe(0);
      station.emit('bang');
      station.emit('bang');
      expect(timesApplied).toBe(1);
    });
  });

