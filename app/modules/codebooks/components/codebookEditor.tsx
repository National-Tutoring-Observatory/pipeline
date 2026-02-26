import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookCheck, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  CodebookCategory,
  CodebookCode,
  CodebookExample,
  CodebookVersion,
} from "../codebooks.types";

const EXAMPLE_TYPES = ["NEAR_MISS", "NEAR_HIT", "HIT", "MISS"] as const;

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function createEmptyExample(): CodebookExample {
  return { _id: generateId(), example: "", exampleType: "HIT" };
}

function createEmptyCode(): CodebookCode {
  return { _id: generateId(), code: "", definition: "", examples: [] };
}

function createEmptyCategory(): CodebookCategory {
  return {
    _id: generateId(),
    name: "New category",
    description: "",
    codes: [],
  };
}

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

  const updateCategory = (
    categoryId: string,
    field: keyof CodebookCategory,
    value: string,
  ) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId ? { ...c, [field]: value } : c,
      ),
    );
  };

  const addCode = (categoryId: string) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? { ...c, codes: [...c.codes, createEmptyCode()] }
          : c,
      ),
    );
  };

  const removeCode = (categoryId: string, codeId: string) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? { ...c, codes: c.codes.filter((code) => code._id !== codeId) }
          : c,
      ),
    );
  };

  const updateCode = (
    categoryId: string,
    codeId: string,
    field: keyof CodebookCode,
    value: string,
  ) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? {
              ...c,
              codes: c.codes.map((code) =>
                code._id === codeId ? { ...code, [field]: value } : code,
              ),
            }
          : c,
      ),
    );
  };

  const addExample = (categoryId: string, codeId: string) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? {
              ...c,
              codes: c.codes.map((code) =>
                code._id === codeId
                  ? {
                      ...code,
                      examples: [...code.examples, createEmptyExample()],
                    }
                  : code,
              ),
            }
          : c,
      ),
    );
  };

  const removeExample = (
    categoryId: string,
    codeId: string,
    exampleId: string,
  ) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? {
              ...c,
              codes: c.codes.map((code) =>
                code._id === codeId
                  ? {
                      ...code,
                      examples: code.examples.filter(
                        (ex) => ex._id !== exampleId,
                      ),
                    }
                  : code,
              ),
            }
          : c,
      ),
    );
  };

  const updateExample = (
    categoryId: string,
    codeId: string,
    exampleId: string,
    field: keyof CodebookExample,
    value: string,
  ) => {
    updateCategories(
      categories.map((c) =>
        c._id === categoryId
          ? {
              ...c,
              codes: c.codes.map((code) =>
                code._id === codeId
                  ? {
                      ...code,
                      examples: code.examples.map((ex) =>
                        ex._id === exampleId ? { ...ex, [field]: value } : ex,
                      ),
                    }
                  : code,
              ),
            }
          : c,
      ),
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
                  <div className="grid gap-4 rounded-md border p-4">
                    <div className="grid gap-3">
                      <Label htmlFor={`category-name-${category._id}`}>
                        Category name
                      </Label>
                      <Input
                        id={`category-name-${category._id}`}
                        value={category.name}
                        disabled={disabled}
                        autoComplete="off"
                        onChange={(e) =>
                          updateCategory(category._id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor={`category-desc-${category._id}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`category-desc-${category._id}`}
                        value={category.description}
                        disabled={disabled}
                        onChange={(e) =>
                          updateCategory(
                            category._id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    {!disabled && (
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeCategory(category._id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove category
                        </Button>
                      </div>
                    )}
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label>Codes</Label>
                        {!disabled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addCode(category._id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add code
                          </Button>
                        )}
                      </div>
                      {category.codes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No codes yet. Add a code to this category.
                        </p>
                      ) : (
                        <Accordion type="multiple" className="w-full">
                          {category.codes.map((code) => (
                            <AccordionItem key={code._id} value={code._id}>
                              <AccordionTrigger>
                                {code.code || "Untitled code"}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid gap-4">
                                  <div className="grid gap-3">
                                    <Label htmlFor={`code-${code._id}`}>
                                      Code
                                    </Label>
                                    <Input
                                      id={`code-${code._id}`}
                                      value={code.code}
                                      disabled={disabled}
                                      autoComplete="off"
                                      onChange={(e) =>
                                        updateCode(
                                          category._id,
                                          code._id,
                                          "code",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor={`definition-${code._id}`}>
                                      Definition
                                    </Label>
                                    <Textarea
                                      id={`definition-${code._id}`}
                                      value={code.definition}
                                      disabled={disabled}
                                      onChange={(e) =>
                                        updateCode(
                                          category._id,
                                          code._id,
                                          "definition",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  {!disabled && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="w-fit"
                                      onClick={() =>
                                        removeCode(category._id, code._id)
                                      }
                                    >
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      Remove code
                                    </Button>
                                  )}
                                  <div className="grid gap-3">
                                    <div className="flex items-center justify-between">
                                      <Label>Examples</Label>
                                      {!disabled && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            addExample(category._id, code._id)
                                          }
                                        >
                                          <Plus className="mr-1 h-3 w-3" />
                                          Add example
                                        </Button>
                                      )}
                                    </div>
                                    {code.examples.length === 0 ? (
                                      <p className="text-muted-foreground text-sm">
                                        No examples yet.
                                      </p>
                                    ) : (
                                      <div className="grid gap-3">
                                        {code.examples.map((example) => (
                                          <div
                                            key={example._id}
                                            className="flex items-start gap-3 rounded-md border p-3"
                                          >
                                            <div className="grid flex-1 gap-2">
                                              <Input
                                                placeholder="Example text"
                                                value={example.example}
                                                disabled={disabled}
                                                autoComplete="off"
                                                onChange={(e) =>
                                                  updateExample(
                                                    category._id,
                                                    code._id,
                                                    example._id,
                                                    "example",
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                              <Select
                                                value={example.exampleType}
                                                disabled={disabled}
                                                onValueChange={(value) =>
                                                  updateExample(
                                                    category._id,
                                                    code._id,
                                                    example._id,
                                                    "exampleType",
                                                    value,
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="w-[180px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {EXAMPLE_TYPES.map((type) => (
                                                    <SelectItem
                                                      key={type}
                                                      value={type}
                                                    >
                                                      {type.replace(/_/g, " ")}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            {!disabled && (
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive shrink-0"
                                                onClick={() =>
                                                  removeExample(
                                                    category._id,
                                                    code._id,
                                                    example._id,
                                                  )
                                                }
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
