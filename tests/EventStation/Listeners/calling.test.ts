import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../../src/main";
describe("Listeners#calling()", function () {
  let station, callback;
  station = undefined;
  callback = undefined;
  beforeEach(function () {
    station = new EventStation();
    callback = function () {};
  });
  it("must set the callback of the listeners", function () {
    let listener;
    station.on("boom").calling(callback);
    listener = station.stationMeta.listenersMap.boom[0];
    expect(listener.callback).toBe(callback);
  });
  it("must set the matching callback of the listeners", function () {
    let listener;
    station.on("boom").calling(callback);
    listener = station.stationMeta.listenersMap.boom[0];
    expect(listener.matchCallback).toBe(callback);
  });
});
