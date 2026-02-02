import find from "lodash/find";
import get from "lodash/get";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PromptReference } from "~/modules/collections/collections.types";
import PromptSelector from "../components/promptSelector";
import type { PromptVersion } from "../prompts.types";

export default function PromptSelectorContainer({
  annotationType,
  selectedPrompt,
  selectedPromptVersion,
  selectedPrompts,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
}: {
  annotationType: string;
  selectedPrompt: string | null;
  selectedPromptVersion: number | null;
  selectedPrompts?: PromptReference[];
  onSelectedPromptChanged: (
    selectedPrompt: string,
    selectedPromptName?: string,
  ) => void;
  onSelectedPromptVersionChanged: (selectedPromptVersion: number) => void;
}) {
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isPromptVersionsOpen, setIsPromptVersionsOpen] = useState(false);
  const fetchedVersionsByPrompt = useRef<Record<string, PromptVersion[]>>({});

  const promptsFetcher = useFetcher();
  const promptVersionsFetcher = useFetcher();

  const onTogglePromptPopover = (isPromptsOpen: boolean) => {
    setIsPromptsOpen(isPromptsOpen);
    if (isPromptsOpen) {
      const params = new URLSearchParams();
      params.set("annotationType", annotationType);
      promptsFetcher.load(`/api/promptsList?${params.toString()}`);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("annotationType", annotationType);

    promptsFetcher.load(`/api/promptsList?${params.toString()}`);

    if (selectedPrompt) {
      params.set("prompt", selectedPrompt);
      promptVersionsFetcher.load(
        `/api/promptVersionsList?${params.toString()}`,
      );
    }
  }, [selectedPrompt]);

  const onTogglePromptVersionsPopover = (isPromptsOpen: boolean) => {
    setIsPromptVersionsOpen(isPromptsOpen);
  };

  const onSelectedPromptChange = (selectedPrompt: string) => {
    const selectedPromptItem = find(promptsFetcher.data.prompts.data, {
      _id: selectedPrompt,
    });
    onSelectedPromptChanged(selectedPrompt, selectedPromptItem?.name);
    const params = new URLSearchParams();
    params.set("prompt", selectedPrompt);
    promptVersionsFetcher.load(`/api/promptVersionsList?${params.toString()}`);
    if (selectedPromptItem?.productionVersion != null) {
      onSelectedPromptVersionChanged(selectedPromptItem.productionVersion);
    }
  };

  const onSelectedPromptVersionChange = (selectedPromptVersion: number) => {
    onSelectedPromptVersionChanged(selectedPromptVersion);
  };

  const prompts = get(promptsFetcher, "data.prompts.data", []);

  const promptVersions: PromptVersion[] = get(
    promptVersionsFetcher,
    "data.promptVersions.data",
    [],
  );

  if (selectedPrompt && promptVersions.length > 0) {
    fetchedVersionsByPrompt.current[selectedPrompt] = promptVersions;
  }

  const filteredPrompts = prompts.filter((prompt: { _id: string }) => {
    const fetchedVersions = fetchedVersionsByPrompt.current[prompt._id];
    if (!fetchedVersions) return true;

    const selectedForThisPrompt =
      selectedPrompts?.filter((sp) => sp.promptId === prompt._id) || [];

    return selectedForThisPrompt.length < fetchedVersions.length;
  });

  const filteredVersions = promptVersions.filter((version) => {
    return !selectedPrompts?.some(
      (sp) => sp.promptId === selectedPrompt && sp.version === version.version,
    );
  });

  let productionVersion = null;
  if (selectedPrompt) {
    const selectedPromptItem = find(promptsFetcher.data?.prompts?.data, {
      _id: selectedPrompt,
    });
    if (selectedPromptItem) {
      productionVersion = selectedPromptItem.productionVersion;
    }
  }

  return (
    <PromptSelector
      prompts={filteredPrompts}
      promptVersions={filteredVersions}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      productionVersion={productionVersion}
      isLoadingPrompts={promptsFetcher.state === "loading"}
      isLoadingPromptVersions={promptVersionsFetcher.state === "loading"}
      isPromptsOpen={isPromptsOpen}
      isPromptVersionsOpen={isPromptVersionsOpen}
      onTogglePromptPopover={onTogglePromptPopover}
      onTogglePromptVersionsPopover={onTogglePromptVersionsPopover}
      onSelectedPromptChange={onSelectedPromptChange}
      onSelectedPromptVersionChange={onSelectedPromptVersionChange}
    />
  );
}
