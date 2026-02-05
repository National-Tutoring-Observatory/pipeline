import { useState } from "react";
import aiGatewayConfig from "../../../config/ai_gateway.json";
import ModelSelector from "../components/modelSelector";

export default function ModelSelectorContainer({
  selectedModel,
  excludeModels = [],
  onSelectedModelChanged,
}: {
  selectedModel: string;
  excludeModels?: string[];
  onSelectedModelChanged: (selectedModel: string) => void;
}) {
  const [isModelsOpen, setIsModelsOpen] = useState(false);

  const onToggleModelPopover = (isModelsOpen: boolean) => {
    setIsModelsOpen(isModelsOpen);
  };

  const providersWithFilteredModels = aiGatewayConfig.providers.map(
    (provider) => ({
      ...provider,
      models: provider.models.filter((m) => !excludeModels.includes(m.code)),
    }),
  );

  const nonEmptyProviders = providersWithFilteredModels.filter(
    (provider) => provider.models.length > 0,
  );

  return (
    <ModelSelector
      providers={nonEmptyProviders}
      selectedModel={selectedModel}
      isModelsOpen={isModelsOpen}
      onToggleModelPopover={onToggleModelPopover}
      onSelectedModelChanged={onSelectedModelChanged}
    />
  );
}
