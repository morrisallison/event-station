import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";

describe("Listeners#all()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;

  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("boom pow bash", function () {});
  });

  afterEach(function () {
    EventStation.reset();
  });

  it("must make a promise that resolves when all of the listeners have been applied at least once", async () => {
    const all = listeners.all();

    station.emit("boom pow bash");

    expect(await all).toHaveLength(3);
  });
});
