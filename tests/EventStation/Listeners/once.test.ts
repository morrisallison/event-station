import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../../src/main";
describe("EventStation#once()", function () {
  let car, listeners, timeDriven;
  car = undefined;
  listeners = undefined;
  timeDriven = undefined;
  beforeEach(function () {
    car = new EventStation();
    listeners = car.on("drive", function () {});
    timeDriven = 0;
    car.on("drive").once(function () {
      timeDriven++;
    });
  });
  it("must restrict the listener to one application", function () {
    expect(timeDriven).toBe(0);
    car.emit("drive");
    car.emit("drive");
    expect(timeDriven).toBe(1);
  });
});
