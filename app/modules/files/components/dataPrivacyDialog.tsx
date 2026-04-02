import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Lock,
  Settings,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

export default function DataPrivacyDialog() {
  return (
    <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-full">
            <ShieldCheck className="text-primary size-5" />
          </div>
          Data Privacy & Security
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5 text-sm">
        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <Lock className="text-primary size-4" />
            Storage & Encryption
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Your uploaded data is encrypted at rest and in transit using
            industry-standard AES-256 encryption. Data is stored on secure,
            access-controlled servers.
          </p>
        </section>

        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <ShieldCheck className="text-primary size-4" />
            Cornell Secure AI Gateway
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            All LLM API calls are routed through Cornell University&apos;s AI
            Gateway, a secure, university-managed proxy operated by the AI
            Innovation Hub. The gateway ensures that your prompts, responses,
            and data are never stored or used by the underlying model providers.
            No data passes directly to third-party AI services outside of this
            controlled environment.
          </p>
        </section>

        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <Settings className="text-primary size-4" />
            How your data is used
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Your data is used exclusively to run the annotation jobs you
            configure. Sandpiper&apos;s orchestration engine sends segments of
            your data to the LLM providers you select (e.g., OpenAI, Google,
            Anthropic) solely for annotation processing, routed through
            Cornell&apos;s secure gateway. No data is retained by these
            providers beyond the scope of each API call.
          </p>
        </section>

        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <XCircle className="text-primary size-4" />
            What we will never do
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Your uploaded data will not be used to train, fine-tune, evaluate,
            or improve foundation models, large language models, speech models,
            tutoring models, biometric systems, identity recognition systems,
            emotion inference systems, or other general-purpose AI systems.
          </p>
          <p className="text-muted-foreground mt-1.5 leading-relaxed">
            Additionally, we will never:
          </p>
          <ul className="text-muted-foreground mt-1 list-disc space-y-0.5 pl-5">
            <li>Share, publish, or distribute your data to third parties</li>
            <li>Access your data for internal research or analysis</li>
            <li>Sell or license your data in any form</li>
            <li>
              Use your data to develop or improve Sandpiper&apos;s own systems
            </li>
          </ul>
        </section>

        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <Trash2 className="text-primary size-4" />
            Data retention & deletion
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            You may delete your data at any time from your project settings.
            Upon deletion, all associated files and annotations are permanently
            removed from our servers within 30 days.
          </p>
        </section>

        <section>
          <h4 className="mb-1.5 flex items-center gap-2 font-semibold">
            <ClipboardCheck className="text-primary size-4" />
            Compliance
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Sandpiper is designed with FERPA-eligible workflows in mind for
            researchers working with educational data. All data processing is
            handled within Cornell&apos;s secure infrastructure, aligned with
            the university&apos;s AI guidelines and data classification
            standards for moderate-risk institutional data.
          </p>
        </section>

        <div className="text-muted-foreground border-t pt-3 text-xs">
          Questions? Reach us at&nbsp;
          <a
            href="mailto:privacy@sandpiperresearch.org"
            className="text-primary font-semibold hover:underline"
          >
            privacy@sandpiperresearch.org
          </a>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button>Got it</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
