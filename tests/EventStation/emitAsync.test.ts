import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../src/main";
describe("EventStation#emitAsync()", function () {
  let allDone, boomDone, powDone, station, totalEvents;
  allDone = undefined;
  boomDone = undefined;
  powDone = undefined;
  station = undefined;
  totalEvents = undefined;
  beforeEach(function () {
    EventStation.inject("Promise", Promise);
    station = new EventStation();
    boomDone = 0;
    powDone = 0;
    allDone = 0;
    totalEvents = 0;
  });
  afterEach(function () {
    EventStation.reset();
  });
  it("must return a promise that is resolves to an array when the station has no attached listeners", async function () {
    const result = await station.emitAsync("boom");

    expect(result).toEqual([]);
  });
  it("must return a promise that is resolved when no listeners return promises", function () {
    station.on("pow", function () {
      powDone++;
    });
    station.on("boom", function () {
      boomDone++;
    });
    expect(powDone).toBe(0);
    expect(boomDone).toBe(0);
    return station.emitAsync(["pow", "boom"]).then(function () {
      expect(powDone).toBe(1);
      expect(boomDone).toBe(1);
    });
  });
  it("must return a promise that resolves after all listeners have finished", function () {
    let promise;
    station.on("pow", function () {});
    station.on("boom", async () => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          boomDone++;
          resolve();
        }, 0);
      });
    });
    promise = station.emitAsync(["pow", "boom"]).then(function () {
      expect(boomDone).toBe(1);
    });
    expect(boomDone).toBe(0);
    return promise;
  });
  it("must not delay synchronous listeners", function () {
    let promise;
    station.on("pow", function () {
      powDone++;
    });
    station.on("boom", function () {
      return new Promise(function (resolve) {
        setTimeout(resolve, 0);
      });
    });
    promise = station.emitAsync(["pow", "boom"]);
    expect(powDone).toBe(1);
    return promise;
  });
  it("must throw an error when a promise object is NOT available", function () {
    let promiseCallback, check;
    EventStation.inject("Promise", undefined);
    promiseCallback = function () {
      return Promise.resolve();
    };
    station.on("pow", promiseCallback);
    station.on("boom", promiseCallback);
    check = function () {
      station.emitAsync(["pow", "boom"]);
    };
    expect(check).toThrow(Error);
  });
  it("must emit four events to three listeners while passing arguments and returning a promise", async () => {
    station.on("all", async (eventName, bash, bam, smash) => {
      expect(eventName === "pow" || eventName === "boom").toBe(true);
      expect(bash).toBe("bash");
      expect(bam).toBe("bam");
      expect(smash).toBe("smash");

      allDone++;
      totalEvents++;
    });
    station.on("pow", async (bash, bam, smash) => {
      expect(bash).toBe("bash");
      expect(bam).toBe("bam");
      expect(smash).toBe("smash");

      powDone++;
      totalEvents++;
    });
    station.on("boom", async (bash, bam, smash) => {
      expect(bash).toBe("bash");
      expect(bam).toBe("bam");
      expect(smash).toBe("smash");

      boomDone++;
      totalEvents++;
    });

    expect(allDone).toBe(0);
    expect(powDone).toBe(0);
    expect(boomDone).toBe(0);
    expect(totalEvents).toBe(0);

    await station.emitAsync(["pow", "boom"], "bash", "bam", "smash");

    expect(allDone).toBe(2);
    expect(powDone).toBe(1);
    expect(boomDone).toBe(1);
    expect(totalEvents).toBe(4);
  });
});
