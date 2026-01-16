import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import ModelSelectorContainer from "~/modules/prompts/containers/modelSelectorContainer";
import CollectionCreatorSelectedItem from "./collectionCreatorSelectedItem";

const CollectionCreatorModels = ({
  selectedModels,
  tempModel,
  onTempModelChanged,
  onAddModel,
  onRemoveModel
}: {
  selectedModels: string[];
  tempModel: string;
  onTempModelChanged: (model: string) => void,
  onAddModel: () => void,
  onRemoveModel: (model: string) => void
}) => {
  return (
    <div className="space-y-2">
      <Label>Models</Label>
      <div className="space-y-3">
        <div className="space-y-2">
          <ModelSelectorContainer
            selectedModel={tempModel}
            onSelectedModelChanged={onTempModelChanged}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddModel}
            disabled={!tempModel || selectedModels.includes(tempModel)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </Button>
        </div>

        {selectedModels.length > 0 && (
          <div className="space-y-2 pt-2">
            {selectedModels.map((model) => (
              <CollectionCreatorSelectedItem
                key={model}
                text={model}
                onRemoveClicked={() => onRemoveModel(model)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionCreatorModels;
