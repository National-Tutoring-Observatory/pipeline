import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, LifeBuoy, LoaderPinwheel } from "lucide-react";
import map from 'lodash/map';
import type { SupportArticle } from "../support.types";
import { Button } from "@/components/ui/button";

export default function SupportArticles({
  isLoading,
  supportArticles,
  selectedDocumentId,
  onSupportArticleClicked,
  onBackToSupportArticlesClicked
}: {
  isLoading: boolean,
  supportArticles: SupportArticle[],
  selectedDocumentId: string | null,
  onSupportArticleClicked: (selectedDocumentId: string) => void,
  onBackToSupportArticlesClicked: () => void,
}) {
  return (
    <div>
      <SheetHeader className="sticky top-0 bg-white" >
        <SheetTitle className="flex items-center">
          <LifeBuoy size={16} />
          <span className="ml-2">Help & Support</span>
        </SheetTitle>
        {(!selectedDocumentId) && (
          <SheetDescription>
            Select a help article below to find out more.
          </SheetDescription>
        )}
        {(selectedDocumentId) && (
          <SheetDescription>
            <Button
              variant="ghost"
              className="w-full text-left cursor-pointer flex items-center justify-start"
              onClick={() => onBackToSupportArticlesClicked()}
            >
              <ChevronLeft />
              <span>Back to help articles</span>
            </Button>
          </SheetDescription>
        )}
      </SheetHeader>
      <div className="px-4">

        {(isLoading) && (
          <div className="flex justify-center p-4">
            <LoaderPinwheel size={16} className="animate-spin" />
          </div>
        )}
        {(!selectedDocumentId) && (
          <div>
            {map(supportArticles, (supportArticle: SupportArticle) => {
              return (
                <Button
                  variant="ghost"
                  className="w-full text-left cursor-pointer flex items-center justify-between"
                  key={supportArticle.documentId}
                  onClick={() => onSupportArticleClicked(supportArticle.documentId)}
                >
                  {supportArticle.data.title}
                  <ChevronRight />
                </Button>
              );
            })}
          </div>
        )}
        {(selectedDocumentId) && (
          <div>
            {map(supportArticles, (supportArticle: SupportArticle) => {
              if (supportArticle.documentId === selectedDocumentId) {
                console.log(supportArticle);
                return (
                  <div className="[&_h1]:scroll-m-20 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-balance [&_h1]:mb-4">
                    <div className="[&_h2]:scroll-m-20 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:first:mt-0 [&_h2]:mb-2">
                      <div className="[&_p]:leading-7 [&_p]:[&:not(:first-child)]:mb-6">
                        <div className="[&_ol]:my-6 [&_ol]:ml-6 [&_ol]:list-disc [&_ol]:[&>li]:mt-2">
                          <div dangerouslySetInnerHTML={{ __html: supportArticle.html }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

    </div>
  );
}