import escapeRegExp from "lodash/escapeRegExp";
import orderBy from "lodash/orderBy";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import type { RunSession } from "~/modules/runs/runs.types";

interface PaginateSessionsProps {
  searchValue?: string;
  sort?: string;
  page?: string | number;
  filters?: Record<string, string>;
}

export default function paginateSessions(
  sessions: RunSession[],
  props: PaginateSessionsProps = {},
): { data: RunSession[]; count: number; totalPages: number } {
  let filtered = sessions;

  if (props.searchValue) {
    const regex = new RegExp(escapeRegExp(props.searchValue), "i");
    filtered = filtered.filter((s) => regex.test(s.name));
  }

  if (props.filters?.status) {
    filtered = filtered.filter((s) => s.status === props.filters!.status);
  }

  const sortField = props.sort || "name";
  const desc = sortField.startsWith("-");
  const field = desc ? sortField.slice(1) : sortField;
  const sorted = orderBy(filtered, [field], [desc ? "desc" : "asc"]);

  const { skip, limit } = getPaginationParams(props.page);
  const data = sorted.slice(skip, skip + limit);

  return {
    data,
    count: filtered.length,
    totalPages: getTotalPages(filtered.length),
  };
}
