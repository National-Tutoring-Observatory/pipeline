import { Component, useState } from 'react';
import PromptSelector from '../components/promptSelector';
import { useFetcher } from 'react-router';
import get from 'lodash/get';

export default function PromptSelectorContainer({ annotationType }: { annotationType: string }) {

  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const fetcher = useFetcher()

  const onTogglePopover = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      const params = new URLSearchParams();
      params.set('annotationType', annotationType)
      fetcher.load(`/api/promptsList?${params.toString()}`);
    }
  }

  const onValueChanged = (value: string) => {
    setValue(value);
  }

  const prompts = get(fetcher, 'data.prompts.data') || [];

  return (
    <PromptSelector
      prompts={prompts}
      isLoadingPrompts={fetcher.state === 'loading'}
      isOpen={isOpen}
      value={value}
      onTogglePopover={onTogglePopover}
      onValueChanged={onValueChanged}
    />
  );
}