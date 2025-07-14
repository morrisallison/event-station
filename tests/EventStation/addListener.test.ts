import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../src/main";

describe("EventStation#addListener()", function () {
  let station, stationMeta, listener;
  station = undefined;
  stationMeta = undefined;
  listener = undefined;
  beforeEach(function () {
    station = new EventStation();
    stationMeta = station.stationMeta;
    listener = {
      eventName: "boom",
      callback: function () {},
      context: station,
      matchCallback: function () {},
      matchContext: undefined,
    };
  });
  it("must attach the listener", function () {
    expect(station.hasListener(listener)).toBe(false);
    station.addListener(listener);
    expect(station.hasListener(listener)).toBe(true);
  });
  it("must increase the listener count", function () {
    expect(station.listenerCount).toBe(0);
    station.addListener(listener);
    expect(station.listenerCount).toBe(1);
  });
  it("must attach the exact same listener multiple times", function () {
    expect(station.listenerCount).toBe(0);
    station.addListener(listener);
    station.addListener(listener);
    expect(station.listenerCount).toBe(2);
  });
});
