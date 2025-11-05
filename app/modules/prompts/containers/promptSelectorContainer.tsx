import find from 'lodash/find';
import get from 'lodash/get';
import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import PromptSelector from '../components/promptSelector';

export default function PromptSelectorContainer({
  annotationType,
  selectedPrompt,
  selectedPromptVersion,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged
}: {
  annotationType: string,
  selectedPrompt: string | null,
  selectedPromptVersion: number | null,
  onSelectedPromptChanged: (selectedPrompt: string) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: number) => void
}) {

  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isPromptVersionsOpen, setIsPromptVersionsOpen] = useState(false);

  const promptsFetcher = useFetcher();
  const promptVersionsFetcher = useFetcher();

  const onTogglePromptPopover = (isPromptsOpen: boolean) => {
    setIsPromptsOpen(isPromptsOpen);
    if (isPromptsOpen) {
      const params = new URLSearchParams();
      params.set('annotationType', annotationType)
      promptsFetcher.load(`/api/promptsList?${params.toString()}`);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('annotationType', annotationType);

    promptsFetcher.load(`/api/promptsList?${params.toString()}`);

    if (selectedPrompt) {
      params.set('prompt', selectedPrompt);
      promptVersionsFetcher.load(`/api/promptVersionsList?${params.toString()}`);
    }
  }, [selectedPrompt]);

  const onTogglePromptVersionsPopover = (isPromptsOpen: boolean) => {
    setIsPromptVersionsOpen(isPromptsOpen);
  }

  const onSelectedPromptChange = (selectedPrompt: string) => {
    onSelectedPromptChanged(selectedPrompt);
    const params = new URLSearchParams();
    params.set('prompt', selectedPrompt)
    promptVersionsFetcher.load(`/api/promptVersionsList?${params.toString()}`);
    const selectedPromptItem = find(promptsFetcher.data.prompts.data, { _id: selectedPrompt });
    if (selectedPromptItem) {
      onSelectedPromptVersionChanged(selectedPromptItem.productionVersion);
    }
  }

  const onSelectedPromptVersionChange = (selectedPromptVersion: number) => {
    onSelectedPromptVersionChanged(selectedPromptVersion)
  }

  const prompts = get(promptsFetcher, 'data.prompts.data', []);

  const promptVersions = get(promptVersionsFetcher, 'data.promptVersions.data', []);

  let productionVersion = null;
  if (selectedPrompt) {
    const selectedPromptItem = find(promptsFetcher.data?.prompts?.data, { _id: selectedPrompt });
    if (selectedPromptItem) {
      productionVersion = selectedPromptItem.productionVersion;
    }
  }

  return (
    <PromptSelector
      prompts={prompts}
      promptVersions={promptVersions}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      productionVersion={productionVersion}
      isLoadingPrompts={promptsFetcher.state === 'loading'}
      isLoadingPromptVersions={promptVersionsFetcher.state === 'loading'}
      isPromptsOpen={isPromptsOpen}
      isPromptVersionsOpen={isPromptVersionsOpen}
      onTogglePromptPopover={onTogglePromptPopover}
      onTogglePromptVersionsPopover={onTogglePromptVersionsPopover}
      onSelectedPromptChange={onSelectedPromptChange}
      onSelectedPromptVersionChange={onSelectedPromptVersionChange}
    />
  );
}
