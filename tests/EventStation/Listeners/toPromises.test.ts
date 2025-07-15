import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("Listeners#toPromises()", function () {
  let station, listeners;
  station = undefined;
  listeners = undefined;
  beforeEach(function () {
    EventStation.inject("Promise", Promise);
    station = new EventStation();
    listeners = station.makeListeners("pow boom bash", function () {});
  });
  afterEach(function () {
    EventStation.reset();
  });
  it("must throw an error if promises are not available", function () {
    let check;
    EventStation.inject("Promise", undefined);
    check = function () {
      listeners.toPromises();
    };
    expect(check).toThrow(Error);
  });
  it("can create multiple promises for the same listeners", function () {
    let promise1, promise2;
    promise1 = listeners.toPromises();
    promise2 = listeners.toPromises();
    return Promise.all([promise1, promise2]);
  });
});
