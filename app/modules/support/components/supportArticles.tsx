import { LoaderPinwheel } from "lucide-react";
import type { SupportArticle } from "../support.types";
import SupportArticleDetail from "./supportArticleDetail";
import SupportArticleList from "./supportArticleList";
import SupportArticlesHeader from "./supportArticlesHeader";

export default function SupportArticles({
  isLoading,
  supportArticles,
  selectedDocumentId,
  onSupportArticleClicked,
  onBackToSupportArticlesClicked,
  onSearchClicked,
}: {
  isLoading: boolean;
  supportArticles: SupportArticle[];
  selectedDocumentId: string | null;
  onSupportArticleClicked: (selectedDocumentId: string) => void;
  onBackToSupportArticlesClicked: () => void;
  onSearchClicked: () => void;
}) {
  const selectedSupportArticle = supportArticles.find(
    (sa) => sa.documentId === selectedDocumentId,
  );
  return (
    <div>
      <SupportArticlesHeader
        selectedDocumentId={selectedDocumentId}
        onBackToSupportArticlesClicked={onBackToSupportArticlesClicked}
        onSearchClicked={onSearchClicked}
      />
      <div className="px-4">
        {isLoading && (
          <div className="flex justify-center p-4">
            <LoaderPinwheel size={16} className="animate-spin" />
          </div>
        )}
        {selectedDocumentId ? (
          <SupportArticleDetail
            article={selectedSupportArticle!}
            onBackToSupportArticlesClicked={onBackToSupportArticlesClicked}
          />
        ) : (
          <SupportArticleList
            supportArticles={supportArticles}
            onSupportArticleClicked={onSupportArticleClicked}
            onSearchClicked={onSearchClicked}
          />
        )}
      </div>
    </div>
  );
}
