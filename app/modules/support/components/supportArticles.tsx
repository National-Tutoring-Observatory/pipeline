import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronRight, LifeBuoy, LoaderPinwheel } from "lucide-react";
import map from 'lodash/map';
import type { SupportArticle } from "../support.types";
import { Button } from "@/components/ui/button";

export default function SupportArticles({
  isLoading,
  supportArticles
}: {
  isLoading: boolean,
  supportArticles: SupportArticle[]
}) {
  return (
    <div>
      <SheetHeader>
        <SheetTitle className="flex items-center">
          <LifeBuoy size={16} />
          <span className="ml-2">Help & Support</span>
        </SheetTitle>
        <SheetDescription>
          Select a help article below to find out more.
        </SheetDescription>
        {(isLoading) && (
          <div className="flex justify-center p-4">
            <LoaderPinwheel size={16} className="animate-spin" />
          </div>
        )}
        <div>
          {map(supportArticles, (supportArticle: SupportArticle) => {
            return (
              <Button variant="ghost" className="w-full text-left cursor-pointer flex items-center justify-between" key={supportArticle.documentId}>
                {supportArticle.data.title}
                <ChevronRight />
              </Button>
            );
          })}
        </div>
      </SheetHeader>
    </div>
  );
}