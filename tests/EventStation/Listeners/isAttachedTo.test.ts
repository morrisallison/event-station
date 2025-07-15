import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#isAttachedTo()", function () {
  let station, station2, listeners;
  station = undefined;
  station2 = undefined;
  listeners = undefined;
  beforeEach(function () {
    station = new EventStation();
    station2 = new EventStation();
    listeners = station.makeListeners("pow boom bash", function () {});
  });
  it("must determine that the listeners are not attached to any station", function () {
    expect(listeners.isAttachedTo()).toBe(false);
  });
  it("must determine that the listeners are not attached to the origin station", function () {
    expect(listeners.isAttachedTo(station)).toBe(false);
  });
  it("must determine that the listeners are not attached to an unrelated station", function () {
    expect(listeners.isAttachedTo(station2)).toBe(false);
  });
  it("must determine that the listeners are attached to specifc station after they are added to a station", function () {
    listeners.addTo(station2);
    expect(listeners.isAttachedTo(station2)).toBe(true);
  });
  it("must determine that the listeners are attached to any station", function () {
    listeners.addTo(station2);
    expect(listeners.isAttachedTo()).toBe(true);
  });
  it("must determine that the listeners are not attached to any station after they are removed", function () {
    listeners.addTo(station2);
    listeners.off();
    expect(listeners.isAttachedTo()).toBe(false);
  });
});
