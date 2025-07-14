import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../src/main";

describe("EventStation.init()", function () {
  let station, stationMeta;
  station = undefined;
  stationMeta = undefined;
  beforeEach(function () {
    let options;
    station = {};
    options = {
      emitAllEvent: false,
      delimiter: ",",
      enableRegExp: true,
      enableDelimiter: false,
    };
    EventStation.init(station, options);
    stationMeta = station.stationMeta;
  });
  it("must create a `stationMeta` property on the given object", function () {
    expect(stationMeta).toBeObject();
  });
  it("must set the `emitAllEvent` option to `false`", function () {
    expect(stationMeta.emitAllEvent).toBe(false);
  });
  it("must set the `enableDelimiter` option to `false`", function () {
    expect(stationMeta.enableDelimiter).toBe(false);
  });
  it("must set the `enableRegExp` option to `true`", function () {
    expect(stationMeta.enableRegExp).toBe(true);
  });
  it("must set the `delimiter` option to a comma", function () {
    expect(stationMeta.delimiter).toBe(",");
  });
  it("must set the `hearingCount` property to zero (0)", function () {
    expect(stationMeta.hearingCount).toBe(0);
  });
  it("must set the `listenerCount` property to zero (0)", function () {
    expect(stationMeta.listenerCount).toBe(0);
  });
  it("must set the `isPropagationStopped` option to `false`", function () {
    expect(stationMeta.isPropagationStopped).toBe(false);
  });
  it("must set the `listenersMap` property to an object with a `NULL` prototype", function () {
    expect(stationMeta.listenersMap).toBeObject();
    expect(Object.getPrototypeOf(stationMeta.listenersMap)).toBeNull();
  });
  it("must set the `heardStations` property to an object with a `NULL` prototype", function () {
    expect(stationMeta.heardStations).toBeObject();
    expect(Object.getPrototypeOf(stationMeta.heardStations)).toBeNull();
  });
});
describe("EventStation.init()", function () {
  let station;
  station = undefined;
  beforeEach(function () {
    station = {};
  });
  it("must throw an error when the delimiter is an empty string", function () {
    let check;
    check = function () {
      EventStation.init(station, {
        delimiter: "",
      });
    };
    expect(check).toThrow(Error);
  });
  it("must throw an error when the RegExp marker is an empty string", function () {
    let check;
    check = function () {
      EventStation.init(station, {
        regExpMarker: "",
      });
    };
    expect(check).toThrow(Error);
  });
  it("must throw an error when the RegExp marker contains the delimiter", function () {
    let check;
    check = function () {
      EventStation.init(station, {
        regExpMarker: "this has spaces",
      });
    };
    expect(check).toThrow(Error);
  });
});
