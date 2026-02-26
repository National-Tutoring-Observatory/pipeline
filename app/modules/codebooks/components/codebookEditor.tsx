import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCheck, Plus, Save } from "lucide-react";
import { useState } from "react";
import type { CodebookCategory, CodebookVersion } from "../codebooks.types";
import { createEmptyCategory } from "../helpers/codebookEditorHelpers";
import CodebookCategoryEditor from "./codebookCategoryEditor";

export default function CodebookEditor({
  codebookVersion,
  isLoading,
  isProduction,
  onSaveCodebookVersion,
  onMakeCodebookVersionProduction,
}: {
  codebookVersion: CodebookVersion;
  isLoading: boolean;
  isProduction: boolean;
  onSaveCodebookVersion: ({
    name,
    categories,
  }: {
    name: string;
    categories: CodebookCategory[];
  }) => void;
  onMakeCodebookVersionProduction: () => void;
}) {
  const [hasChanges, setHasChanges] = useState(false);
  const [name, setName] = useState(codebookVersion.name);
  const [categories, setCategories] = useState<CodebookCategory[]>(
    codebookVersion.categories,
  );
  const [activeTab, setActiveTab] = useState(
    categories.length > 0 ? categories[0]._id : "",
  );

  const disabled = codebookVersion.hasBeenSaved;

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true);
    setName(event.target.value);
  };

  const updateCategories = (updated: CodebookCategory[]) => {
    setHasChanges(true);
    setCategories(updated);
  };

  const addCategory = () => {
    const newCategory = createEmptyCategory();
    const updated = [...categories, newCategory];
    updateCategories(updated);
    setActiveTab(newCategory._id);
  };

  const removeCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c._id !== categoryId);
    updateCategories(updated);
    if (activeTab === categoryId && updated.length > 0) {
      setActiveTab(updated[0]._id);
    }
  };

  const updateCategory = (updated: CodebookCategory) => {
    updateCategories(
      categories.map((c) => (c._id === updated._id ? updated : c)),
    );
  };

  const onSaveClicked = () => {
    onSaveCodebookVersion({ name, categories });
  };

  return (
    <div className="border-l">
      <div className="flex items-center justify-between border-b p-2 text-sm">
        <div>
          <div>{`Version: ${codebookVersion.name}`}</div>
        </div>
        <div className="flex items-center space-x-4">
          {!isProduction && codebookVersion.hasBeenSaved && (
            <Button
              variant="ghost"
              className="cursor-pointer hover:text-indigo-600"
              onClick={onMakeCodebookVersionProduction}
            >
              <BookCheck />
              Make production version
            </Button>
          )}
          {!codebookVersion.hasBeenSaved && (
            <Button
              variant="ghost"
              className="cursor-pointer hover:text-indigo-600"
              disabled={!hasChanges || isLoading}
              onClick={onSaveClicked}
            >
              <Save />
              Save codebook version
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-8 p-8">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            disabled={disabled}
            autoComplete="off"
            onChange={onNameChanged}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Categories</Label>
            {!disabled && (
              <Button size="sm" variant="outline" onClick={addCategory}>
                <Plus className="mr-1 h-3 w-3" />
                Add category
              </Button>
            )}
          </div>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No categories yet. Add a category to get started.
            </p>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {categories.map((category) => (
                  <TabsTrigger key={category._id} value={category._id}>
                    {category.name || "Untitled"}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((category) => (
                <TabsContent key={category._id} value={category._id}>
                  <CodebookCategoryEditor
                    category={category}
                    disabled={disabled}
                    onChange={updateCategory}
                    onRemove={() => removeCategory(category._id)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
