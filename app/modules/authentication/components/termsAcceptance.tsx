import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLinkIcon,
  LockIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import FullTermsDialog from "./fullTermsDialog";

interface TermsAcceptanceProps {
  isSubmitting: boolean;
  onAccept: () => void;
}

export default function TermsAcceptance({
  isSubmitting,
  onAccept,
}: TermsAcceptanceProps) {
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#f7f7f7]">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img
            src="/assets/nto-logo-icon.png"
            alt="NTO Logo"
            className="w-12"
          />
        </div>
        <h1 className="mb-1 text-center text-2xl font-semibold">
          Terms of Use &amp; Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-6 text-center text-sm">
          Hosted by Cornell University
        </p>

        <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
          By using Sandpiper, you agree to our Terms of Use and Privacy Policy.
          Your data is encrypted, routed through Cornell&rsquo;s Secure AI
          Gateway, and never used to train AI models.{" "}
          <button
            type="button"
            className="text-primary font-semibold hover:underline"
            onClick={() => setTermsOpen(true)}
          >
            View full terms
          </button>
        </p>

        <div className="mb-5 space-y-3">
          <Highlight icon={<LockIcon className="size-4" />}>
            AES-256 encryption at rest and in transit on AWS
          </Highlight>
          <Highlight icon={<ShieldCheckIcon className="size-4" />}>
            All LLM calls routed through Cornell&rsquo;s Secure AI Gateway
          </Highlight>
          <Highlight icon={<XCircleIcon className="size-4" />}>
            Data never used to train, fine-tune, or improve AI systems
          </Highlight>
          <Highlight icon={<Trash2Icon className="size-4" />}>
            Delete your data anytime from project settings
          </Highlight>
        </div>

        <div className="border-border mb-5 border-t" />

        <div className="mb-6 flex items-center gap-2">
          <Checkbox
            id="terms-accept"
            className="mb-0.5"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label
            htmlFor="terms-accept"
            className="cursor-pointer text-sm leading-relaxed font-medium"
          >
            I have read and agree to the{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => setTermsOpen(true)}
            >
              Terms&nbsp;of&nbsp;Use and Privacy&nbsp;Policy
            </button>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
            onClick={() => setTermsOpen(true)}
          >
            <ExternalLinkIcon className="size-3.5" />
            View full terms
          </button>
          <Button disabled={!accepted || isSubmitting} onClick={onAccept}>
            {isSubmitting ? "Saving..." : "Continue \u2192"}
          </Button>
        </div>
      </div>

      <FullTermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </div>
  );
}

function Highlight({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="text-muted-foreground flex items-start gap-2 text-sm">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
