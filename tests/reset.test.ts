import { expect } from "bun:test";
import { beforeAll, describe, it, beforeEach, afterAll } from "bun:test";

import { EventStation } from "../src/main";
describe("EventStation.config()", function () {
  beforeEach(function () {
    EventStation.config({
      emitAllEvent: false,
    });
  });
  it("must reset global configuration", function () {
    expect(new EventStation().stationMeta.emitAllEvent).toBe(false);
    EventStation.reset();
    expect(new EventStation().stationMeta.emitAllEvent).toBe(true);
  });
  it("must not affect the configuration of existing stations", function () {
    let station;
    station = new EventStation();
    expect(station.stationMeta.emitAllEvent).toBe(false);
    EventStation.reset();
    expect(station.stationMeta.emitAllEvent).toBe(false);
  });
});
