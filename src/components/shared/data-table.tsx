"use client";

import { createContext, Suspense, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createColumnHelper,
  FlexRender,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type RowData,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ListFilter,
  Search,
  SearchX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { useTableParams } from "@/components/shared/use-table-params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_PAGE_SIZE,
  getPageInfo,
  isFilterKey,
  MAX_SEARCH_LENGTH,
  PAGE_SIZE_OPTIONS,
  parseTableParams,
  readParam,
  type PageInfo,
  type TableParamsChange,
  type TableSort,
} from "@/lib/table-params";
import { cn } from "@/lib/utils";

type DataTableColumnMeta = {
  align?: "left" | "right";
};

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type DataTableProps<TData extends RowData> = {
  columns: TableOptions<DataTableFeatures, TData>["columns"];
  data: TData[];
  label: string;
  rowCount?: number;
  sortableColumns?: readonly string[];
  searchPlaceholder?: string;
  filters?: ReactNode;
  getRowId?: (row: TData) => string;
  emptyState?: ReactNode;
};

type DataTableViewProps<TData extends RowData> = DataTableProps<TData> & {
  sort: TableSort | null;
  q: string;
  isFiltered?: boolean;
  page: number;
  pageSize: number;
  onChange?: (change: TableParamsChange) => void;
  isPending?: boolean;
};

const NO_SORTABLE_COLUMNS: readonly string[] = [];
const SEARCH_DEBOUNCE_MS = 300;

function alignClass(align: DataTableColumnMeta["align"]) {
  return align === "right" ? "text-right tabular-nums" : undefined;
}

function toSortingState(sort: TableSort | null): SortingState {
  return sort ? [sort] : [];
}

function DataTableView<TData extends RowData>({
  columns,
  data,
  label,
  rowCount,
  sortableColumns = NO_SORTABLE_COLUMNS,
  searchPlaceholder,
  filters,
  getRowId,
  emptyState,
  sort,
  q,
  isFiltered = false,
  page,
  pageSize,
  onChange,
  isPending = false,
}: DataTableViewProps<TData>) {
  const sorting = toSortingState(sort);
  const pageInfo = rowCount === undefined ? null : getPageInfo(rowCount, page, pageSize);
  const pagination: PaginationState = {
    pageIndex: (pageInfo?.page ?? 1) - 1,
    pageSize,
  };

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualSorting: true,
    enableMultiSort: false,
    sortDescFirst: false,
    manualPagination: true,
    autoResetPageIndex: false,
    rowCount,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      onChange?.({ sort: next[0] ?? null });
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (next.pageSize !== pagination.pageSize) {
        onChange?.({ pageSize: next.pageSize });
      } else {
        onChange?.({ page: next.pageIndex + 1 });
      }
    },
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className="flex flex-col gap-4">
      {(searchPlaceholder || filters) && (
        <div className="flex flex-wrap items-center gap-4">
          {searchPlaceholder && (
            <DataTableSearch
              q={q}
              placeholder={searchPlaceholder}
              onSearch={onChange ? (nextQ) => onChange({ q: nextQ }) : undefined}
            />
          )}
          {filters && (
            <div className="flex max-w-full shrink-0 flex-wrap items-center gap-4">{filters}</div>
          )}
        </div>
      )}
      <Table
        aria-label={label}
        aria-busy={isPending}
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none",
          isPending && "opacity-60",
        )}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { column } = header;
                const isRight = column.columnDef.meta?.align === "right";
                const canSort = Boolean(onChange) && sortableColumns.includes(column.id);
                const direction = column.getIsSorted();
                const SortIcon =
                  direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

                return (
                  <TableHead
                    key={header.id}
                    className={cn(isRight && "text-right")}
                    aria-sort={
                      canSort
                        ? direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={column.getToggleSortingHandler()}
                        className={cn(
                          "-mx-2 inline-flex h-8 items-center gap-1 rounded-md px-2 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                          direction && "text-foreground",
                        )}
                      >
                        <FlexRender header={header} />
                        <SortIcon
                          aria-hidden
                          className={cn("size-3.5", !direction && "text-muted-foreground/60")}
                        />
                      </button>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={alignClass(cell.column.columnDef.meta?.align)}
                  >
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-auto p-0 whitespace-normal">
                {q ? (
                  <EmptyState
                    icon={SearchX}
                    title={`No results for "${q}"`}
                    description="Check the spelling or try a different search."
                    className="rounded-none border-0 bg-transparent"
                  />
                ) : isFiltered ? (
                  <EmptyState
                    icon={ListFilter}
                    title="No matching results"
                    description="Try changing or clearing the filters."
                    className="rounded-none border-0 bg-transparent"
                  />
                ) : (
                  (emptyState ?? (
                    <EmptyState
                      icon={Inbox}
                      title="No results"
                      description="There's nothing to show here yet."
                      className="rounded-none border-0 bg-transparent"
                    />
                  ))
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pageInfo && rowCount !== undefined && rowCount > 0 && onChange && (
        <DataTablePagination
          pageInfo={pageInfo}
          rowCount={rowCount}
          pageSize={pageSize}
          canPrevious={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

type DataTableSearchProps = {
  q: string;
  placeholder: string;
  onSearch?: (q: string) => void;
};

function DataTableSearch({ q, placeholder, onSearch }: DataTableSearchProps) {
  const [value, setValue] = useState(q);

  useEffect(() => {
    if (!onSearch || value.trim() === q) return;

    const timer = setTimeout(() => onSearch(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, q, onSearch]);

  return (
    <div className="relative w-full md:w-80">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        maxLength={MAX_SEARCH_LENGTH}
        disabled={!onSearch}
        onChange={(event) => setValue(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}

type DataTablePaginationProps = {
  pageInfo: PageInfo;
  rowCount: number;
  pageSize: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
};

function DataTablePagination({
  pageInfo,
  rowCount,
  pageSize,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const t = useTranslations("table.pagination");

  return (
    <nav
      aria-label={t("label")}
      className="flex flex-col gap-4 text-body-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
    >
      <p className="tabular-nums">
        {t("showing", { from: pageInfo.from, to: pageInfo.to, total: rowCount })}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          {t("rowsPerPage")}
          <NativeSelect
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </NativeSelect>
        </label>
        <p aria-live="polite" className="tabular-nums">
          {t("pageOf", { page: pageInfo.page, pageCount: pageInfo.pageCount })}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!canPrevious} onClick={onPrevious}>
            <ChevronLeft data-icon="inline-start" aria-hidden />
            {t("previous")}
          </Button>
          <Button variant="outline" disabled={!canNext} onClick={onNext}>
            {t("next")}
            <ChevronRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </div>
    </nav>
  );
}

type DataTableFilterContextValue = {
  getValue: (key: string) => string;
  setValue: (key: string, value: string | null) => void;
};

const DataTableFilterContext = createContext<DataTableFilterContextValue | null>(null);

export function useDataTableFilter(key: string) {
  const context = useContext(DataTableFilterContext);

  return {
    value: context?.getValue(key) ?? "",
    setValue: (value: string | null) => context?.setValue(key, value),
    disabled: context === null,
  };
}

function DataTableWithUrlState<TData extends RowData>(props: DataTableProps<TData>) {
  const { searchParams, setTableParams, isPending } = useTableParams();
  const params = parseTableParams(searchParams, props.sortableColumns ?? NO_SORTABLE_COLUMNS);
  const isFiltered = [...searchParams.keys()].some(isFilterKey);

  const filterContext: DataTableFilterContextValue = {
    getValue: (key) => readParam(searchParams, key) ?? "",
    setValue: (key, value) => setTableParams({ filters: { [key]: value } }),
  };

  return (
    <DataTableFilterContext value={filterContext}>
      <DataTableView
        {...props}
        sort={params.sort}
        q={params.q}
        isFiltered={isFiltered}
        page={params.page}
        pageSize={params.pageSize}
        onChange={setTableParams}
        isPending={isPending}
      />
    </DataTableFilterContext>
  );
}

export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  return (
    <Suspense
      fallback={<DataTableView {...props} sort={null} q="" page={1} pageSize={DEFAULT_PAGE_SIZE} />}
    >
      <DataTableWithUrlState {...props} />
    </Suspense>
  );
}
