import { useState } from "react";
import type { CodebookVersion } from "../codebooks.types";
import CreatePromptFromCodebookDialog from "../components/createPromptFromCodebookDialog";

export default function CreatePromptFromCodebookDialogContainer({
  codebookVersions,
  productionVersion,
  onCreatePromptClicked,
  isSubmitting = false,
}: {
  codebookVersions: CodebookVersion[];
  productionVersion: number;
  onCreatePromptClicked: (options: {
    codebookVersionId: string;
    annotationType: string;
    categoryIds: string[];
  }) => void;
  isSubmitting: boolean;
}) {
  const defaultVersion = codebookVersions.find(
    (v) => v.version === productionVersion,
  );
  const initialVersionId =
    defaultVersion?._id ?? codebookVersions[0]?._id ?? "";
  const initialVersion = codebookVersions.find(
    (v) => v._id === initialVersionId,
  );

  const [codebookVersionId, setCodebookVersionId] = useState(initialVersionId);
  const [annotationType, setAnnotationType] = useState("PER_UTTERANCE");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    () => initialVersion?.categories.map((c) => c._id) ?? [],
  );
  const [hasFlattenedCategories, setHasFlattenedCategories] = useState(false);

  const selectedVersion = codebookVersions.find(
    (v) => v._id === codebookVersionId,
  );
  const categories = selectedVersion?.categories ?? [];

  const isSubmitDisabled =
    !codebookVersionId || categoryIds.length === 0 || isSubmitting;

  const hasAllCategoriesSelected =
    categories.length > 0 && categoryIds.length === categories.length;

  const handleCodebookVersionChanged = (nextId: string) => {
    setCodebookVersionId(nextId);
    const nextVersion = codebookVersions.find((v) => v._id === nextId);
    setCategoryIds(nextVersion?.categories.map((c) => c._id) ?? []);
  };

  const handleCategoryToggled = (categoryId: string, checked: boolean) => {
    setCategoryIds((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId),
    );
  };

  const handleToggleAllCategoriesClicked = () => {
    setCategoryIds(
      hasAllCategoriesSelected ? [] : categories.map((c) => c._id),
    );
  };

  const handleSubmitClicked = () => {
    console.log("[CreatePromptFromCodebookDialog] submit", {
      codebookVersionId,
      annotationType,
      categoryIds,
    });
    onCreatePromptClicked({
      codebookVersionId,
      annotationType,
      categoryIds,
    });
  };

  return (
    <CreatePromptFromCodebookDialog
      codebookVersions={codebookVersions}
      productionVersion={productionVersion}
      codebookVersionId={codebookVersionId}
      annotationType={annotationType}
      categoryIds={categoryIds}
      categories={categories}
      hasFlattenedCategories={hasFlattenedCategories}
      hasAllCategoriesSelected={hasAllCategoriesSelected}
      isSubmitDisabled={isSubmitDisabled}
      onCodebookVersionChanged={handleCodebookVersionChanged}
      onAnnotationTypeChanged={setAnnotationType}
      onCategoryToggled={handleCategoryToggled}
      onToggleAllCategoriesClicked={handleToggleAllCategoriesClicked}
      onHasFlattenedCategoriesChanged={setHasFlattenedCategories}
      onSubmitClicked={handleSubmitClicked}
    />
  );
}
