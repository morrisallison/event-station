import { EventStation } from "../../src/main";
import { expect } from "bun:test";
import { describe, it } from "bun:test";

describe("extends EventStation", function () {
  class Martian extends EventStation {}

  it("must work as an EventStation instance", function () {
    const alien = new Martian();
    const earthling = new EventStation();

    let earthlingGreeted = false;

    alien.hear(earthling, "greet", function () {
      earthlingGreeted = true;
    });

    earthling.emit("greet");

    expect(earthlingGreeted).toBe(true);
  });
});
