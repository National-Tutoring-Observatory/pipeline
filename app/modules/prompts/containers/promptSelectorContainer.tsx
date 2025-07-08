import { Component, useState } from 'react';
import PromptSelector from '../components/promptSelector';
import { useFetcher } from 'react-router';
import get from 'lodash/get';
import find from 'lodash/find';

export default function PromptSelectorContainer({
  annotationType,
  selectedPrompt,
  selectedPromptVersion,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged
}: {
  annotationType: string,
  selectedPrompt: string,
  selectedPromptVersion: string,
  onSelectedPromptChanged: (selectedPrompt: string) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: string) => void
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

  const onTogglePromptVersionsPopover = (isPromptsOpen: boolean) => {
    setIsPromptVersionsOpen(isPromptsOpen);
  }

  const onSelectedPromptChange = (selectedPrompt: string) => {
    onSelectedPromptChanged(selectedPrompt);
    const params = new URLSearchParams();
    params.set('prompt', selectedPrompt)
    promptVersionsFetcher.load(`/api/promptVersionsList?${params.toString()}`);
    const selectedPromptItem = find(promptsFetcher.data.prompts.data, { _id: Number(selectedPrompt) });
    if (selectedPromptItem) {
      onSelectedPromptVersionChanged(`${selectedPromptItem.latestVersion}`);
    }
  }

  const onSelectedPromptVersionChange = (selectedPromptVersion: string) => {
    onSelectedPromptVersionChanged(selectedPromptVersion)
  }

  const prompts = get(promptsFetcher, 'data.prompts.data', []);

  const promptVersions = get(promptVersionsFetcher, 'data.promptVersions.data', []);

  let latestVersion = null;
  if (selectedPrompt) {
    const selectedPromptItem = find(promptsFetcher.data.prompts.data, { _id: Number(selectedPrompt) });
    latestVersion = selectedPromptItem.latestVersion;
  }

  return (
    <PromptSelector
      prompts={prompts}
      promptVersions={promptVersions}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      latestVersion={latestVersion}
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