import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#race()", function () {
  let listeners, station;

  listeners = undefined;
  station = undefined;

  beforeEach(function () {
    station = new EventStation();
    listeners = station.on("boom pow bash", function () {});
  });

  afterEach(function () {
    EventStation.reset();
  });

  it("make a promise that resolves as soon as one of the listeners is applied", async () => {
    let race, listener;
    race = listeners.race();
    listener = listeners.get(0);
    station.emit("boom");
    expect(await race).toBe(listener);
  });
});
