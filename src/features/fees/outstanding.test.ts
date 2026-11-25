import { describe, expect, it } from "vitest";
import { summarizeOutstanding, type OutstandingDue } from "./outstanding";

const kasun = { student_id: "s1", admission_no: "ADM-0003", full_name: "Kasun Bandara" };
const nimal = { student_id: "s2", admission_no: "ADM-0001", full_name: "Nimal Perera" };
const amaya = { student_id: "s3", admission_no: "ADM-0002", full_name: "Amaya Silva" };

function due(
  student: typeof kasun,
  month: string,
  subject: string,
  balance: number,
): OutstandingDue {
  return { ...student, month, subject, grade: 10, balance };
}

describe("summarizeOutstanding", () => {
  it("returns nothing when there are no dues", () => {
    expect(summarizeOutstanding([])).toEqual([]);
  });

  it("adds up one student's balances across classes and months", () => {
    const [row] = summarizeOutstanding([
      due(kasun, "2026-10-01", "Maths", 1250),
      due(kasun, "2026-11-01", "Maths", 2500),
      due(kasun, "2026-11-01", "Science", 0.1),
      due(kasun, "2026-10-01", "Science", 0.2),
    ]);

    expect(row).toEqual({
      studentId: "s1",
      admissionNo: "ADM-0003",
      fullName: "Kasun Bandara",
      total: 3750.3,
      monthCount: 2,
      oldestMonth: "2026-10",
      classes: [
        { subject: "Maths", grade: 10 },
        { subject: "Science", grade: 10 },
      ],
    });
  });

  it("leaves out dues with nothing left to pay", () => {
    expect(
      summarizeOutstanding([
        due(nimal, "2026-10-01", "Maths", 0),
        due(kasun, "2026-11-01", "Maths", 500),
      ]),
    ).toHaveLength(1);
  });

  it("sorts by the highest amount, then more months, then name", () => {
    const rows = summarizeOutstanding([
      due(nimal, "2026-11-01", "Maths", 1000),
      due(kasun, "2026-11-01", "Maths", 2500),
      due(amaya, "2026-10-01", "Maths", 500),
      due(amaya, "2026-11-01", "English", 500),
    ]);

    expect(rows.map((row) => row.fullName)).toEqual([
      "Kasun Bandara",
      "Amaya Silva",
      "Nimal Perera",
    ]);
  });

  it("sorts students with the same amount and months by name", () => {
    const rows = summarizeOutstanding([
      due(nimal, "2026-11-01", "Maths", 1000),
      due(amaya, "2026-11-01", "Maths", 1000),
    ]);

    expect(rows.map((row) => row.fullName)).toEqual(["Amaya Silva", "Nimal Perera"]);
  });
});
