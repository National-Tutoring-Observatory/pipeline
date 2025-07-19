import { useState } from 'react';
import ModelSelector from '../components/modelSelector';

export default function ModelSelectorContainer({
  selectedModel,
  onSelectedModelChanged
}: {
  selectedModel: string,
  onSelectedModelChanged: (selectedModel: string) => void,
}) {

  const [isModelsOpen, setIsModelsOpen] = useState(false);

  const onToggleModelPopover = (isModelsOpen: boolean) => {
    setIsModelsOpen(isModelsOpen);
  }

  return (
    <ModelSelector
      models={[{
        provider: 'GEMINI',
        name: 'Gemini'
      }, {
        provider: 'CHAT_GPT',
        name: 'Chat GPT'
      }]}
      selectedModel={selectedModel}
      isModelsOpen={isModelsOpen}
      onToggleModelPopover={onToggleModelPopover}
      onSelectedModelChanged={onSelectedModelChanged}
    />
  )
}