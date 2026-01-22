import { useState } from "react";
import aiGatewayConfig from "../../../config/ai_gateway.json";
import ModelSelector from "../components/modelSelector";

export default function ModelSelectorContainer({
  selectedModel,
  onSelectedModelChanged,
}: {
  selectedModel: string;
  onSelectedModelChanged: (selectedModel: string) => void;
}) {
  const [isModelsOpen, setIsModelsOpen] = useState(false);

  const onToggleModelPopover = (isModelsOpen: boolean) => {
    setIsModelsOpen(isModelsOpen);
  };

  return (
    <ModelSelector
      providers={aiGatewayConfig.providers}
      selectedModel={selectedModel}
      isModelsOpen={isModelsOpen}
      onToggleModelPopover={onToggleModelPopover}
      onSelectedModelChanged={onSelectedModelChanged}
    />
  );
}
