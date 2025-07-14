import { expect } from "bun:test";
import { describe, it, beforeEach, afterEach } from "bun:test";

import EventStation from "../../src/main";
describe("EventStation#hearOnce()", function () {
  let student, teacher, timesApplied, listeners;
  student = undefined;
  teacher = undefined;
  timesApplied = undefined;
  listeners = undefined;
  beforeEach(function () {
    student = new EventStation();
    teacher = new EventStation();
    timesApplied = 0;
    listeners = teacher.hearOnce(student, "ask", function () {
      timesApplied++;
    });
  });
  it("must attach a listener to the other station", function () {
    let listener;
    listener = student.getListeners().get(0);
    expect(listener).toBeObject();
  });
  it("must remove the listener from the other station after the last occurrence", function () {
    expect(student.getListeners().count).toBe(1);
    student.emit("ask");
    student.emit("ask");
    expect(student.getListeners()).toBeUndefined();
  });
  it("must restrict the listener to one application", function () {
    expect(timesApplied).toBe(0);
    student.emit("ask");
    student.emit("ask");
    expect(timesApplied).toBe(1);
  });
});
