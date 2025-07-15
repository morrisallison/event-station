import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#race()", function () {
  let listeners, station;
  listeners = undefined;
  station = undefined;
  beforeEach(function () {
    EventStation.inject("Promise", Promise);
    station = new EventStation();
    listeners = station.on("boom pow bash", function () {});
  });
  afterEach(function () {
    EventStation.reset();
  });
  it("must throw an error if promises are not available", function () {
    let check;
    EventStation.inject("Promise", undefined);
    check = function () {
      listeners.race();
    };
    expect(check).toThrow(Error);
  });
  it("make a promise that resolves as soon as one of the listeners is applied", async () => {
    let race, listener;
    race = listeners.race();
    listener = listeners.get(0);
    station.emit("boom");
    expect(await race).toBe(listener);
  });
});
