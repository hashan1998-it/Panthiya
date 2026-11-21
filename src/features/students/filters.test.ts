import { describe, expect, it } from "vitest";
import { parseStudentFilters } from "./filters";

describe("parseStudentFilters", () => {
  it("shows only active students when the URL has no filters", () => {
    expect(parseStudentFilters({})).toEqual({ grade: null, status: "active" });
  });

  it("reads status=all as every student", () => {
    expect(parseStudentFilters({ status: "all" }).status).toBe("all");
  });

  it("reads a valid grade and status", () => {
    expect(parseStudentFilters({ grade: "10", status: "inactive" })).toEqual({
      grade: 10,
      status: "inactive",
    });
  });

  it("ignores a grade outside 1-13 or not a whole number", () => {
    expect(parseStudentFilters({ grade: "0" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "14" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "10.5" }).grade).toBeNull();
    expect(parseStudentFilters({ grade: "abc" }).grade).toBeNull();
  });

  it("falls back to active for an unknown status", () => {
    expect(parseStudentFilters({ status: "deleted" }).status).toBe("active");
  });

  it("works with URLSearchParams too", () => {
    expect(parseStudentFilters(new URLSearchParams("grade=11&status=active"))).toEqual({
      grade: 11,
      status: "active",
    });
  });
});
