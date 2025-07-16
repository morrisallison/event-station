import { EventStation } from "../src/main";
import { expect } from "bun:test";
import { describe, it, beforeEach } from "bun:test";

describe("EventStation", function () {
  let listener, Wonderfuls, wonderfulsHeardSinging, WonderGirls;

  listener = undefined;
  Wonderfuls = undefined;
  wonderfulsHeardSinging = undefined;
  WonderGirls = undefined;

  beforeEach(function () {
    WonderGirls = new EventStation();
    // Dynamically create an anonymous class extending EventStation
    Wonderfuls = new (class extends EventStation {})();
    wonderfulsHeardSinging = false;
    listener = function () {
      wonderfulsHeardSinging = true;
    };
  });

  it("interoperates with dynamic types", function () {
    EventStation.init(Wonderfuls);
    Wonderfuls.hear(WonderGirls, "sing", listener);
    WonderGirls.emit("sing");
    expect(Wonderfuls.isHearing(WonderGirls)).toBe(true);
    expect(wonderfulsHeardSinging).toBe(true);
  });

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
});
