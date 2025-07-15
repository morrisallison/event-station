import { expect } from "bun:test";
import { describe, it, beforeAll, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("My imagination (>.<)", function () {
  let JusticeLeague;
  JusticeLeague = undefined;
  beforeAll(function () {
    JusticeLeague = function (str) {};
  });
  describe("When Superman called the Justice League", function () {
    let Batman, Superman, stationMeta;
    Batman = undefined;
    Superman = undefined;
    stationMeta = undefined;
    beforeAll(function () {
      Batman = new EventStation();
      Superman = new EventStation();
      stationMeta = Superman.stationMeta;
      Batman.hear(Superman, "call", JusticeLeague);
    });
    it("Batman disregarded him", function () {
      Batman.disregard(Superman);
      expect(Superman.isHeard()).toBe(false);
    });
  });
  describe("When Superman called the Justice League the second time", function () {
    let Batman, Superman, emergencyCall, stationMeta;
    Batman = undefined;
    Superman = undefined;
    emergencyCall = undefined;
    stationMeta = undefined;
    beforeAll(function () {
      Batman = new EventStation();
      Superman = new EventStation();
      emergencyCall =
        "0111000001100001011100110111001101110111011011110111001001100100";
      stationMeta = Superman.stationMeta;
    });
    it(", Batman tried to ignore it, but Superman used the emergency protocol and forced the call through", function () {
      Batman.disregard(Superman, "call", JusticeLeague);
      Batman.hear(Superman, emergencyCall, JusticeLeague);
      expect(Superman.isHeard()).toBe(true);
    });
    it(', Batman answered while yelling "No, I will not attend Lois\'s birthday as Bruce!" then hung up', function () {
      Batman.disregard(Superman, emergencyCall, JusticeLeague);
      expect(Superman.listenerCount).toBe(0);
    });
  });
  describe("The Hulk's attacks", function () {
    let hulkAttacks, Ironman, Hulk, stationMeta;
    hulkAttacks = undefined;
    Ironman = undefined;
    Hulk = undefined;
    stationMeta = undefined;
    beforeAll(function () {
      hulkAttacks = {
        smash: function () {},
        smashHard: function () {},
        smashHarder: function () {},
      };
      Ironman = new EventStation();
      Hulk = new EventStation();
      stationMeta = Hulk.stationMeta;
      Ironman.hear(Hulk, hulkAttacks);
    });
    it("don't phase Ironman", function () {
      Ironman.disregard(Hulk, hulkAttacks);
      expect(Hulk.isHeard()).toBe(false);
    });
  });
  describe("Vegeta, what does the scouter say about his power level?", function () {
    let powerLevel, Nappa, Vegeta;
    powerLevel = undefined;
    Nappa = undefined;
    Vegeta = undefined;
    beforeAll(function () {
      powerLevel = ["it's", "over", "9000"];
      Nappa = new EventStation();
      Vegeta = new EventStation();
      Nappa.hear(Vegeta, powerLevel, function () {});
    });
    it("It's over 9000!!!", function () {
      Nappa.disregard(Vegeta, powerLevel);
      expect(Vegeta.getListeners()).toBeUndefined();
    });
  });
});
