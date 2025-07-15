import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../src/main";

describe("EventStation.create()", function () {
  it("must create an extended object literal", function () {
    let station;
    station = EventStation.create();
    expect(station.emit).toBeFunction();
  });

  it("must initialize the object literal", function () {
    let station;
    station = EventStation.create();
    expect(station.stationMeta).toBeObject();
  });
});
