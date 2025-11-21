import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SearchSupportArticlesDialog({
  searchValue,
  onSearchValueChange,
  results,
  onSelectArticle
}: {
  searchValue: string,
  onSearchValueChange: (val: string) => void,
  results: { documentId: string, title: string, snippet?: string }[],
  onSelectArticle: (documentId: string) => void
}) {
  const MIN_SEARCH_LENGTH = 3;
  const trimmedSearch = searchValue.trim();
  return (
    <DialogContent className="max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Search Support Articles</DialogTitle>
        <DialogDescription>Find help articles by keyword.</DialogDescription>
      </DialogHeader>
      <input
        type="text"
        className="w-full border rounded px-2 py-1 mb-4"
        placeholder="Search..."
        value={searchValue}
        onChange={e => onSearchValueChange(e.target.value)}
        autoFocus
      />
      <div className="flex-1 overflow-y-auto min-h-0">
        {results.length > 0
          ? results.map(article => (
            <div key={article.documentId} className="mb-3">
              <Button
                variant="ghost"
                className="w-full text-left mb-1"
                onClick={() => onSelectArticle(article.documentId)}
              >
                {article.title}
              </Button>
              {article.snippet && (
                <div
                  className="text-xs text-muted-foreground px-2 py-1"
                  dangerouslySetInnerHTML={{ __html: article.snippet }}
                />
              )}
            </div>
          ))
          : (trimmedSearch.length > 0 && trimmedSearch.length < MIN_SEARCH_LENGTH ? (
            <div className="text-muted-foreground py-2 px-2">Enter at least {MIN_SEARCH_LENGTH} characters to search.</div>
          ) : (trimmedSearch.length >= MIN_SEARCH_LENGTH ? (
            <div className="text-muted-foreground py-2 px-2">No results found.</div>
          ) : null))}
      </div>
      <DialogFooter className="justify-end mt-4 flex-shrink-0">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
