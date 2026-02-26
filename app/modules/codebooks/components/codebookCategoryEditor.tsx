import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { CodebookCategory, CodebookCode } from "../codebooks.types";
import { createEmptyCode } from "../helpers/codebookEditorHelpers";
import CodebookCodeEditor from "./codebookCodeEditor";

export default function CodebookCategoryEditor({
  category,
  disabled,
  onChange,
  onRemove,
}: {
  category: CodebookCategory;
  disabled: boolean;
  onChange: (category: CodebookCategory) => void;
  onRemove: () => void;
}) {
  const addCode = () => {
    onChange({ ...category, codes: [...category.codes, createEmptyCode()] });
  };

  const removeCode = (codeId: string) => {
    onChange({
      ...category,
      codes: category.codes.filter((c) => c._id !== codeId),
    });
  };

  const updateCode = (updated: CodebookCode) => {
    onChange({
      ...category,
      codes: category.codes.map((c) => (c._id === updated._id ? updated : c)),
    });
  };

  return (
    <div className="grid gap-4 rounded-md border p-4">
      <div className="grid gap-3">
        <Label htmlFor={`category-name-${category._id}`}>Category name</Label>
        <Input
          id={`category-name-${category._id}`}
          value={category.name}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => onChange({ ...category, name: e.target.value })}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor={`category-desc-${category._id}`}>Description</Label>
        <Textarea
          id={`category-desc-${category._id}`}
          value={category.description}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...category, description: e.target.value })
          }
        />
      </div>
      {!disabled && (
        <div className="flex items-center justify-between">
          <Button size="sm" variant="destructive" onClick={onRemove}>
            <Trash2 className="mr-1 h-3 w-3" />
            Remove category
          </Button>
        </div>
      )}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label>Codes</Label>
          {!disabled && (
            <Button size="sm" variant="outline" onClick={addCode}>
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
                  <CodebookCodeEditor
                    code={code}
                    disabled={disabled}
                    onChange={updateCode}
                    onRemove={() => removeCode(code._id)}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
