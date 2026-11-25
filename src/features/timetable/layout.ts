export const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0] as const;

const DEFAULT_RANGE = { start: 8 * 60, end: 18 * 60 };

export type TimetableClass = {
  id: string;
  subject: string;
  grade: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type PlacedClass<T extends TimetableClass = TimetableClass> = T & {
  lane: number;
  lanes: number;
};

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getTimeRange(classes: readonly TimetableClass[]): { start: number; end: number } {
  if (classes.length === 0) return DEFAULT_RANGE;

  const start = Math.min(...classes.map((klass) => toMinutes(klass.start_time)));
  const end = Math.max(...classes.map((klass) => toMinutes(klass.end_time)));

  return { start: Math.floor(start / 60) * 60, end: Math.ceil(end / 60) * 60 };
}

export function layoutDay<T extends TimetableClass>(classes: readonly T[]): PlacedClass<T>[] {
  const sorted = [...classes].sort(
    (a, b) =>
      toMinutes(a.start_time) - toMinutes(b.start_time) ||
      toMinutes(a.end_time) - toMinutes(b.end_time),
  );

  const placed: PlacedClass<T>[] = [];
  let cluster: PlacedClass<T>[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    for (const item of cluster) item.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };

  for (const klass of sorted) {
    const start = toMinutes(klass.start_time);
    const end = toMinutes(klass.end_time);

    if (start >= clusterEnd) closeCluster();

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    const item = { ...klass, lane, lanes: 1 };
    cluster.push(item);
    placed.push(item);
    clusterEnd = Math.max(clusterEnd, end);
  }
  closeCluster();

  return placed;
}
