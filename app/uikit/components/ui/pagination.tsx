import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPaginationChanged: (currentPage: number) => void;
};

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPaginationChanged,
}: PaginationProps) {
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        aria-label="Previous"
        className="shadow-none"
        disabled={currentPage === 1}
        onClick={() => onPaginationChanged(currentPage - 1)}
      >
        <ArrowLeft />
      </Button>
      <div className="border-y border-r justify-center min-w-20 flex items-center text-xs h-9">
        {`${currentPage} / ${totalPages}`}
      </div>
      <Button
        variant="outline"
        aria-label="Next"
        className="shadow-none"
        disabled={currentPage === totalPages}
        onClick={() => onPaginationChanged(currentPage + 1)}
      >
        <ArrowRight />
      </Button>
    </ButtonGroup>
  );
}

export { Pagination };
