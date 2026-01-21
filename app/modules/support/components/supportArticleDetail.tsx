import type { SupportArticle } from "../support.types";

export default function SupportArticleDetail({
  article,
  onBackToSupportArticlesClicked,
}: {
  article: SupportArticle;
  onBackToSupportArticlesClicked: () => void;
}) {
  return (
    <div className="px-4">
      <div
        key={article.documentId}
        className="[&_h1]:scroll-m-20 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-balance [&_h1]:mb-4"
      >
        <div className="[&_h2]:scroll-m-20 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:first:mt-0 [&_h2]:mb-2">
          <div className="[&_p]:leading-7 [&_p]:[&:not(:first-child)]:mb-6">
            <div className="[&_ol]:my-6 [&_ol]:ml-6 [&_ol]:list-disc [&_ol]:[&>li]:mt-2">
              <div dangerouslySetInnerHTML={{ __html: article.html }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
