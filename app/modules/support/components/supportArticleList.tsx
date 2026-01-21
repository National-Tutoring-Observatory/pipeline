import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { SupportArticle } from "../support.types";

export default function SupportArticleList({
  supportArticles,
  onSupportArticleClicked,
  onSearchClicked,
}: {
  supportArticles: SupportArticle[];
  onSupportArticleClicked: (selectedDocumentId: string) => void;
  onSearchClicked: () => void;
}) {
  return (
    <div className="px-4">
      {supportArticles.map((supportArticle) => (
        <Button
          variant="ghost"
          className="flex w-full cursor-pointer items-center justify-between text-left"
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
