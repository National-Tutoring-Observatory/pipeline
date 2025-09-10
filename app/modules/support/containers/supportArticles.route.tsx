import type { Route } from "./+types/supportArticles.route";
import fs from 'fs';
import path from 'path';
import Markdoc from '@markdoc/markdoc';
import matter from 'gray-matter';

export async function loader({ request }: Route.LoaderArgs) {

  const supportArticles = [] as any;

  const documentsInDirectory = fs.readdirSync('./documentation').filter(file => path.extname(file) === '.md');

  for (const document of documentsInDirectory) {
    const markdownContent = fs.readFileSync(path.join('./documentation', document), 'utf-8');
    const data = matter(markdownContent);

    if (Object.keys(data.data).length > 0) {

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