import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../src/main";

describe("EventStation.inject()", function () {
  it("must throw an error when an invalid name is given", function () {
    let check;
    check = function () {
      EventStation.inject("foobar", {});
    };
    expect(check).toThrow(Error);
  });
});
