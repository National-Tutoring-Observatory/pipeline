import Markdoc from '@markdoc/markdoc';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/supportArticles.route";

interface SupportArticle {
  documentId: string;
  data: Record<string, unknown>;
  html: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const supportArticles: SupportArticle[] = [];

  const documentsInDirectory = fs.readdirSync(path.join(process.cwd(), 'documentation')).filter(file => path.extname(file) === '.md');

  for (const document of documentsInDirectory) {
    const markdownContent = fs.readFileSync(path.join(process.cwd(), 'documentation', document), 'utf-8');
    const data = matter(markdownContent);

    if (Object.keys(data.data).length > 0 && data.data.isPublished) {

      const ast = Markdoc.parse(data.content);

      const content = Markdoc.transform(ast);

      const html = Markdoc.renderers.html(content);

      supportArticles.push({
        documentId: document,
        data: data.data,
        html
      })
    }
  }

  return {
    count: supportArticles.length,
    data: supportArticles
  }

}
