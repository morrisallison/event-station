import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("EventStation#stopPropagation()", function () {
  let station, firstApplied, secondApplied;

  station = undefined;
  firstApplied = undefined;
  secondApplied = undefined;

  beforeEach(function () {
    station = new EventStation();
    firstApplied = 0;
    secondApplied = 0;
    station.on("boom", function (this: EventStation) {
      firstApplied++;
      this.stopPropagation();
    });
    station.on("boom", function () {
      secondApplied++;
    });
  });

  it("allows listeners to be called before propagation is stopped", function () {
    station.emit("boom");

    expect(firstApplied).toBe(1);
  });

  it("don't call listeners after propagation is stopped", function () {
    station.emit("boom");

    expect(secondApplied).toBe(0);
  });
});
