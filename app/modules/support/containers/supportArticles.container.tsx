import { useEffect, useState } from 'react';
import SupportArticles from '../components/supportArticles';
import type { SupportArticle } from '../support.types';
import { useFetcher } from 'react-router';
import get from 'lodash/get';

export default function SupportArticlesContianer() {

  const [isLoading, setIsLoading] = useState(true);
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load(`/api/supportArticles`);
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [fetcher.state]);

  const supportArticles: SupportArticle[] = get(fetcher, 'data.data', []);

  return (
    <SupportArticles
      isLoading={isLoading}
      supportArticles={supportArticles}
    />
  );
}