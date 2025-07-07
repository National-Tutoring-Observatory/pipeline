import { useState } from 'react';
import ModelSelector from '../components/modelSelector';

export default function ModelSelectorContainer() {

  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GEMINI');

  const onToggleModelPopover = (isModelsOpen: boolean) => {
    setIsModelsOpen(isModelsOpen);
  }

  const onSelectedModelChanged = (selectedModel: string) => {
    setSelectedModel(selectedModel);
  }

  return (
    <ModelSelector
      models={[{
        provider: 'GEMINI',
        name: 'Gemini'
      }, {
        provider: 'CHAT_GPT',
        name: 'Chat GPT'
      }, {
        provider: 'CLAUDE',
        name: 'Claude'
      }]}
      selectedModel={selectedModel}
      isModelsOpen={isModelsOpen}
      onToggleModelPopover={onToggleModelPopover}
      onSelectedModelChanged={onSelectedModelChanged}
    />
  )
}