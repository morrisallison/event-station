import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import { EventStation } from "../../src/main";
describe("EventStation#hear()", function () {
  type EVT = {
    lecturing: (this: EventStation) => void;
  };

  let student: EventStation<EVT>, teacher: EventStation<EVT>;

  beforeEach(function () {
    student = new EventStation();
    teacher = new EventStation();
  });

  it("must attach a listener to the other station", function () {
    student.hear(teacher, "lecturing", function () {});
    expect(student.hearingCount).toBe(1);
    expect(teacher.listenerCount).toBe(1);
  });

  it("must have set the correct event name", function () {
    let lecturingListener;
    student.hear(teacher, "lecturing", function () {});
    lecturingListener = teacher.stationMeta.listenersMap.lecturing[0];
    expect(lecturingListener.eventName).toBe("lecturing");
  });

  it("must have set the first station as the context", function () {
    let lecturingListener;
    student.hear(teacher, "lecturing", function () {});
    lecturingListener = teacher.stationMeta.listenersMap.lecturing[0];
    expect(lecturingListener.context).toBe(student);
  });

  it("must have set `undefined` as the `matchContext`", function () {
    let lecturingListener;
    student.hear(teacher, "lecturing", function () {});
    lecturingListener = teacher.stationMeta.listenersMap.lecturing[0];
    expect(lecturingListener.matchContext).toBeUndefined();
  });
});
