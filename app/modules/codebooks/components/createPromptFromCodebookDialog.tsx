import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { annotationTypeOptions } from "~/modules/annotations/helpers/annotationTypes";
import type { CodebookCategory, CodebookVersion } from "../codebooks.types";

export default function CreatePromptFromCodebookDialog({
  codebookVersions,
  productionVersion,
  codebookVersionId,
  annotationType,
  categoryIds,
  categories,
  hasFlattenedCategories,
  hasAllCategoriesSelected,
  isSubmitDisabled,
  onCodebookVersionChanged,
  onAnnotationTypeChanged,
  onCategoryToggled,
  onToggleAllCategoriesClicked,
  onHasFlattenedCategoriesChanged,
  onSubmitClicked,
}: {
  codebookVersions: CodebookVersion[];
  productionVersion: number;
  codebookVersionId: string;
  annotationType: string;
  categoryIds: string[];
  categories: CodebookCategory[];
  hasFlattenedCategories: boolean;
  hasAllCategoriesSelected: boolean;
  isSubmitDisabled: boolean;
  onCodebookVersionChanged: (id: string) => void;
  onAnnotationTypeChanged: (type: string) => void;
  onCategoryToggled: (categoryId: string, checked: boolean) => void;
  onToggleAllCategoriesClicked: () => void;
  onHasFlattenedCategoriesChanged: (value: boolean) => void;
  onSubmitClicked: () => void;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create prompt from codebook</DialogTitle>
        <DialogDescription>
          Generate a prompt using AI from the selected codebook version. The
          codebook categories and codes will be used to build the annotation
          schema.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="codebook-version">Codebook version</Label>
        <Select
          value={codebookVersionId}
          onValueChange={onCodebookVersionChanged}
        >
          <SelectTrigger id="codebook-version" className="w-[240px]">
            <SelectValue placeholder="Select a version" />
          </SelectTrigger>
          <SelectContent>
            {codebookVersions.map((v) => (
              <SelectItem key={v._id} value={v._id}>
                {v.name} (v{v.version})
                {v.version === productionVersion ? " - Production" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label htmlFor="annotation-type">Annotation type</Label>
        <Select value={annotationType} onValueChange={onAnnotationTypeChanged}>
          <SelectTrigger id="annotation-type" className="w-[240px]">
            <SelectValue placeholder="Select an annotation type" />
          </SelectTrigger>
          <SelectContent>
            {annotationTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center justify-between gap-2">
          <Label>Categories to include</Label>
          {categories.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-xs"
              onClick={onToggleAllCategoriesClicked}
            >
              {hasAllCategoriesSelected ? "Deselect all" : "Select all"}
            </Button>
          )}
        </div>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            This codebook version has no categories.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const checkboxId = `category-${category._id}`;
              const checked = categoryIds.includes(category._id);
              return (
                <div key={category._id} className="flex items-center gap-2">
                  <Checkbox
                    id={checkboxId}
                    checked={checked}
                    onCheckedChange={(next) =>
                      onCategoryToggled(category._id, next === true)
                    }
                  />
                  <Label htmlFor={checkboxId} className="font-normal">
                    {category.name}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label>Flatten categories</Label>
          <p className="text-muted-foreground text-sm">
            Flattening categories will mean that all the categories will be put
            into the prompt as one annotation field key and not multiple.
          </p>
          <div className="flex items-center gap-3">
            <Switch
              id="has-flattened-categories"
              checked={hasFlattenedCategories}
              onCheckedChange={onHasFlattenedCategoriesChanged}
            />
            <Label htmlFor="has-flattened-categories" className="font-normal">
              Flatten categories
            </Label>
          </div>
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitDisabled}
            onClick={onSubmitClicked}
          >
            Create prompt
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
