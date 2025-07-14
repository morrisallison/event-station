import { expect } from "bun:test";
import { beforeAll, describe, it, beforeEach, afterAll } from "bun:test";

import rx from "rx";
import { deps } from "../src/injector";
import EventStation from "../src/main";
describe("EventStation.config()", function () {
  beforeEach(function () {
    EventStation.config({
      emitAllEvent: false,
    });
    EventStation.inject("Promise", Promise);
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
  it("must reset injected dependencies", function () {
    let check;
    EventStation.inject("rx", rx);
    check = function () {
      new EventStation().toObservable("boom");
    };
    expect(check).not.toThrow();
    EventStation.reset();
    expect(check).toThrow(Error);
  });
});
describe("EventStation.config()", function () {
  beforeAll(function () {
    (global as any).window = {};
    (window as any).Promise = "foo";
  });

  afterAll(function () {
    delete (global as any).window;
    deps.$Promise = Promise;
  });

  it("must inject the window promise if available", function () {
    EventStation.reset();

    expect(deps.$Promise).toBe(window.Promise);
  });
});
