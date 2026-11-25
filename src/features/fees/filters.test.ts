import { describe, expect, it } from "vitest";
import { parseDueFilters } from "./filters";

const CLASS_ID = "e29da57e-582b-ee30-5e05-c7e36824e3f5";

describe("parseDueFilters", () => {
  it("has no filters by default", () => {
    expect(parseDueFilters({})).toEqual({ classId: null, status: null });
  });

  it("reads a class and a status", () => {
    expect(parseDueFilters({ class: CLASS_ID, status: "partial" })).toEqual({
      classId: CLASS_ID,
      status: "partial",
    });
  });

  it("accepts every status", () => {
    for (const status of ["paid", "partial", "unpaid"]) {
      expect(parseDueFilters({ status }).status).toBe(status);
    }
  });

  it("ignores an invalid class or status", () => {
    expect(parseDueFilters({ class: "oops", status: "overdue" })).toEqual({
      classId: null,
      status: null,
    });
  });

  it("reads from URLSearchParams too", () => {
    const params = new URLSearchParams({ class: CLASS_ID, status: "unpaid" });
    expect(parseDueFilters(params)).toEqual({ classId: CLASS_ID, status: "unpaid" });
  });
});
