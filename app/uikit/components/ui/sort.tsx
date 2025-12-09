import type { ReactElement } from "react"

export type SortOption = {
  icon?: ReactElement,
  value: string,
  text: string
}

export type FilterOption = {
  value: string,
  text: string
}

export type SortProps = {
  sortOptions?: SortOption[],
  sortValue?: any,
  onSortValueChanged?: (sortValue: {}) => any,
}

const Sort = ({
}: SortProps) => {
  return (
    <div>
      Sort
    </div>
  );
};

export default Sort;
