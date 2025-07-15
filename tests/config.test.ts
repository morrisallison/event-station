import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../src/main";

describe("EventStation.config()", function () {
  let config;
  config = undefined;
  beforeEach(function () {
    config = {
      emitAllEvent: false,
      delimiter: ",",
    };
  });
  afterEach(function () {
    EventStation.reset();
  });
  it("must set emitAllEvent to be false by default", function () {
    let station;
    EventStation.config(config);
    station = new EventStation();
    expect(station.stationMeta.emitAllEvent).toBe(false);
  });
  it("must set delimiter to be a comma by default", function () {
    let station;
    EventStation.config(config);
    station = new EventStation();
    expect(station.stationMeta.delimiter).toBe(",");
  });
  it("must still allow options to be overridden", function () {
    let station;
    EventStation.config(config);
    station = new EventStation({
      emitAllEvent: true,
    });
    expect(station.stationMeta.emitAllEvent).toBe(true);
  });
  it("must throw an error when the delimiter is an empty string", function () {
    let check;
    check = function () {
      EventStation.config({
        delimiter: "",
      });
    };
    expect(check).toThrow(Error);
  });
  it("must throw an error when the RegExp marker is an empty string", function () {
    let check;
    check = function () {
      EventStation.config({
        regExpMarker: "",
      });
    };
    expect(check).toThrow(Error);
  });
  it("must throw an error when the RegExp marker contains the delimiter", function () {
    let check;
    check = function () {
      EventStation.config({
        regExpMarker: "this has spaces",
      });
    };
    expect(check).toThrow(Error);
  });
  it("must not set invalid options", function () {
    let station;
    EventStation.config(config);
    station = new EventStation({
      foo: "bar",
    });
    expect(station.stationMeta.foo).toBeUndefined();
  });
});
