import { useEffect, useState } from "react";
import SearchSupportArticlesDialog from "../components/searchSupportArticlesDialog";
import type { SupportArticle } from "../support.types";

export default function SearchSupportArticlesDialogContainer({
  supportArticles,
  onSelectArticle,
}: {
  supportArticles: SupportArticle[];
  onSelectArticle: (documentId: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const MAX_RESULTS = 10;

  // Debounce search input for performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchValue]);

  function getSnippet(text: string, query: string, maxLength = 100) {
    const matchIdx = text.indexOf(query);
    if (matchIdx === -1) return text.substring(0, maxLength);

    // Center the snippet around the match
    let start = Math.max(
      0,
      matchIdx - Math.floor((maxLength - query.length) / 2),
    );
    let end = start + maxLength;
    if (end > text.length) {
      end = text.length;
      start = Math.max(0, end - maxLength);
    }

    let snippet = text.substring(start, end);

    // Highlight the match
    const highlightRe = new RegExp(`(${query})`, "ig");
    snippet = snippet.replace(highlightRe, "<mark>$1</mark>");

    return `${snippet}...`;
  }

  function htmlToText(html: string): string {
    if (!html) return "";
    const tempDiv = window.document.createElement("div");
    tempDiv.innerHTML = html;
    function walk(node: Node): string {
      let text = "";
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          text += (child as Text).textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = (child as HTMLElement).tagName.toLowerCase();
          let childText = walk(child);
          // Add newlines after block elements
          if (
            [
              "p",
              "div",
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "ul",
              "ol",
              "li",
              "br",
              "section",
              "header",
              "footer",
              "article",
            ].includes(tag)
          ) {
            childText = childText.trim() + "\n";
          }
          text += childText;
        }
      });
      return text;
    }
    return walk(tempDiv).trim();
  }

  function getFilteredResults(query: string) {
    if (query.trim().length < 3) return [];
    const lowerQuery = query.toLowerCase();
    const results = [];
    for (let i = 0; i < supportArticles.length; i++) {
      const article = supportArticles[i];
      const titleLower = article.data.title.toLowerCase();
      const plainText = htmlToText(article.html);
      const contentLower = plainText.toLowerCase();
      if (
        titleLower.includes(lowerQuery) ||
        contentLower.includes(lowerQuery)
      ) {
        const snippet = getSnippet(contentLower, query);
        results.push({
          documentId: article.documentId,
          title: article.data.title,
          snippet,
        });
        if (results.length >= MAX_RESULTS) break;
      }
    }
    return results;
  }

  const results = getFilteredResults(debouncedSearch);

  return (
    <SearchSupportArticlesDialog
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      results={results}
      onSelectArticle={onSelectArticle}
    />
  );
}
