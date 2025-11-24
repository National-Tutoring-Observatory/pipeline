import { Button } from "@/components/ui/button";
import { SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, Search } from "lucide-react";
import type { SupportArticle } from "../support.types";

export default function SupportArticleList({ supportArticles, onSupportArticleClicked, onSearchClicked }: {
  supportArticles: SupportArticle[],
  onSupportArticleClicked: (selectedDocumentId: string) => void,
  onSearchClicked: () => void
}) {
  return (
    <div className="px-4">
      {supportArticles.map((supportArticle) => (
        <Button
          variant="ghost"
          className="w-full text-left cursor-pointer flex items-center justify-between"
          key={supportArticle.documentId}
          onClick={() => onSupportArticleClicked(supportArticle.documentId)}
        >
          {supportArticle.data.title}
          <ChevronRight />
        </Button>
      ))}
    </div>
  );
}
