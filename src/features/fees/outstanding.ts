export type OutstandingDue = {
  student_id: string;
  admission_no: string;
  full_name: string;
  month: string;
  subject: string;
  grade: number;
  balance: number;
};

export type OutstandingClass = {
  subject: string;
  grade: number;
};

export type StudentOutstanding = {
  studentId: string;
  admissionNo: string;
  fullName: string;
  total: number;
  monthCount: number;
  oldestMonth: string;
  classes: OutstandingClass[];
};

export function summarizeOutstanding(dues: OutstandingDue[]): StudentOutstanding[] {
  const byStudent = new Map<
    string,
    {
      due: OutstandingDue;
      cents: number;
      months: Set<string>;
      classes: Map<string, OutstandingClass>;
    }
  >();

  for (const due of dues) {
    if (due.balance <= 0) continue;

    const entry = byStudent.get(due.student_id) ?? {
      due,
      cents: 0,
      months: new Set<string>(),
      classes: new Map<string, OutstandingClass>(),
    };
    entry.cents += Math.round(due.balance * 100);
    entry.months.add(due.month.slice(0, 7));
    entry.classes.set(`${due.subject}|${due.grade}`, { subject: due.subject, grade: due.grade });
    byStudent.set(due.student_id, entry);
  }

  return [...byStudent.values()]
    .map(({ due, cents, months, classes }) => ({
      studentId: due.student_id,
      admissionNo: due.admission_no,
      fullName: due.full_name,
      total: cents / 100,
      monthCount: months.size,
      oldestMonth: [...months].sort()[0],
      classes: [...classes.values()].sort(
        (a, b) => a.subject.localeCompare(b.subject) || a.grade - b.grade,
      ),
    }))
    .sort(
      (a, b) =>
        b.total - a.total || b.monthCount - a.monthCount || a.fullName.localeCompare(b.fullName),
    );
}
