import { z } from "zod";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_SEARCH_LENGTH = 100;

export type TableSort = {
  id: string;
  desc: boolean;
};

export type TableParams = {
  page: number;
  pageSize: number;
  sort: TableSort | null;
  q: string;
};

export type TableParamsChange = Partial<TableParams> & {
  filters?: Record<string, string | null>;
};

export type RawSearchParams = URLSearchParams | Record<string, string | string[] | undefined>;

const RESERVED_KEYS: readonly string[] = ["q", "sort", "page", "pageSize"];

export function isFilterKey(key: string) {
  return !RESERVED_KEYS.includes(key);
}

const pageSchema = z.coerce.number().int().min(1).catch(1);

const pageSizeSchema = z.coerce
  .number()
  .refine((size) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(size))
  .catch(DEFAULT_PAGE_SIZE);

const searchSchema = z.string().trim().max(MAX_SEARCH_LENGTH).catch("");

export function readParam(raw: RawSearchParams, key: string) {
  if (raw instanceof URLSearchParams) {
    return raw.get(key) ?? undefined;
  }
  const value = raw[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(value: string | undefined, sortable: readonly string[]): TableSort | null {
  if (!value) return null;

  const dot = value.lastIndexOf(".");
  const id = value.slice(0, dot);
  const direction = value.slice(dot + 1);

  if (dot === -1 || !sortable.includes(id)) return null;
  if (direction !== "asc" && direction !== "desc") return null;

  return { id, desc: direction === "desc" };
}

export function parseTableParams(raw: RawSearchParams, sortable: readonly string[]): TableParams {
  return {
    page: pageSchema.parse(readParam(raw, "page")),
    pageSize: pageSizeSchema.parse(readParam(raw, "pageSize")),
    sort: parseSort(readParam(raw, "sort"), sortable),
    q: searchSchema.parse(readParam(raw, "q") ?? ""),
  };
}

export type PageInfo = {
  page: number;
  pageCount: number;
  offset: number;
  from: number;
  to: number;
};

export function getPageInfo(rowCount: number, page: number, pageSize: number): PageInfo {
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
  const current = Math.min(page, pageCount);
  const offset = (current - 1) * pageSize;

  return {
    page: current,
    pageCount,
    offset,
    from: rowCount === 0 ? 0 : offset + 1,
    to: Math.min(offset + pageSize, rowCount),
  };
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null) {
  if (value === null) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

export function applyTableParamsChange(
  current: URLSearchParams,
  change: TableParamsChange,
): URLSearchParams {
  const next = new URLSearchParams(current);

  if (change.q !== undefined) {
    setOrDelete(next, "q", change.q.trim() || null);
  }

  if (change.sort !== undefined) {
    const { sort } = change;
    setOrDelete(next, "sort", sort ? `${sort.id}.${sort.desc ? "desc" : "asc"}` : null);
  }

  if (change.pageSize !== undefined) {
    setOrDelete(
      next,
      "pageSize",
      change.pageSize === DEFAULT_PAGE_SIZE ? null : String(change.pageSize),
    );
  }

  for (const [key, value] of Object.entries(change.filters ?? {})) {
    if (isFilterKey(key)) {
      setOrDelete(next, key, value || null);
    }
  }

  if (change.page !== undefined) {
    setOrDelete(next, "page", change.page > 1 ? String(change.page) : null);
  } else {
    next.delete("page");
  }

  return next;
}
