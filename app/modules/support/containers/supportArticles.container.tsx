import get from 'lodash/get';
import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import addDialog from '~/modules/dialogs/addDialog';
import SupportArticles from '../components/supportArticles';
import type { SupportArticle } from '../support.types';
import SearchSupportArticlesDialogContainer from './searchSupportArticlesDialog.container';

export default function SupportArticlesContianer() {

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const fetcher = useFetcher();

  const onSupportArticleClicked = (selectedDocumentId: string) => {
    setSelectedDocumentId(selectedDocumentId);
  }

  const onBackToSupportArticlesClicked = () => {
    setSelectedDocumentId(null);
  }

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

  const onSearchClicked = () => {
    addDialog(
      <SearchSupportArticlesDialogContainer
        supportArticles={supportArticles}
        onSelectArticle={id => {
          setSelectedDocumentId(id);
          addDialog(null); // Close dialog
        }}
      />
    );
  };

  return (
    <SupportArticles
      isLoading={isLoading}
      supportArticles={supportArticles}
      selectedDocumentId={selectedDocumentId}
      onSupportArticleClicked={onSupportArticleClicked}
      onBackToSupportArticlesClicked={onBackToSupportArticlesClicked}
      onSearchClicked={onSearchClicked}
    />
  );
}
