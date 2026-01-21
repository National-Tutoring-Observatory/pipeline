import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, LifeBuoy, Search } from "lucide-react";

export default function SupportArticlesHeader({
  selectedDocumentId,
  onBackToSupportArticlesClicked,
  onSearchClicked,
}: {
  selectedDocumentId: string | null;
  onBackToSupportArticlesClicked: () => void;
  onSearchClicked: () => void;
}) {
  return (
    <SheetHeader className="sticky top-0 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SheetTitle className="flex items-center">
            <LifeBuoy size={16} />
            <span className="ml-2" tabIndex={0}>
              Help & Support
            </span>
          </SheetTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search help articles"
                onClick={onSearchClicked}
              >
                <Search size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Search help articles</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {selectedDocumentId ? (
        <SheetDescription>
          <Button
            variant="ghost"
            className="flex w-full cursor-pointer items-center justify-start text-left"
            onClick={() => onBackToSupportArticlesClicked()}
          >
            <ChevronLeft />
            <span>Back to help articles</span>
          </Button>
        </SheetDescription>
      ) : (
        <SheetDescription>
          Select a help article below to find out more.
        </SheetDescription>
      )}
    </SheetHeader>
  );
}
