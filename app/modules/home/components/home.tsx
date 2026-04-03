import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpToLine,
  FolderOpen,
  Link2,
  PenLine,
  Play,
  Share2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export default function Home({
  billingEnabled,
  initialCredits,
}: {
  billingEnabled: boolean;
  initialCredits: number;
}) {
  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-6 py-8">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Welcome to <span className="text-primary">Sandpiper</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            AI-powered discourse annotation that&apos;s fast, reliable, and
            built for rigorous research.
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            Built by the &nbsp;
            <strong className="text-foreground">
              National Tutoring Observatory
            </strong>
            &nbsp; at Cornell Bowers CIS, with MIT Teaching Systems Lab,
            Carnegie Mellon, and FreshCognate.
          </p>
        </div>
        {billingEnabled && (
          <div className="bg-primary text-primary-foreground flex w-72 shrink-0 items-center gap-4 rounded-lg p-4">
            <div className="bg-sandpiper-primary-hover flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold">
              ${initialCredits}
            </div>
            <div>
              <p className="text-sm font-bold">
                ${initialCredits} in free credits
              </p>
              <p className="text-primary-foreground/80 mt-1 text-xs">
                Annotate <strong>hundreds of transcripts</strong> across
                multiple LLMs, a full research pilot at no cost.
              </p>
            </div>
          </div>
        )}
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <h2 className="text-xl font-semibold">Get Started</h2>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/projects">
                <FolderOpen className="h-4 w-4" />
                Start a Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/prompts">
                <PenLine className="h-4 w-4" />
                Create a Prompt
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-6 text-center text-[10px] font-semibold tracking-widest uppercase">
            How It Works
          </p>
          <div className="flex items-start justify-center gap-4">
            <Step
              icon={<ArrowUpToLine className="text-primary h-5 w-5" />}
              label="Upload"
              sub="Import transcripts"
              borderClass="border-primary"
            />
            <span className="text-muted-foreground mt-6 text-sm">→</span>
            <Step
              icon={<PenLine className="text-destructive h-5 w-5" />}
              label="Prompt"
              sub="Define coding scheme"
              borderClass="border-destructive"
            />
            <span className="text-muted-foreground mt-6 text-sm">→</span>
            <Step
              icon={<Share2 className="text-primary h-5 w-5" />}
              label="Orchestrate"
              sub="Multiple LLMs + adjudication"
              borderClass="border-primary"
            />
            <span className="text-muted-foreground mt-6 text-sm">→</span>
            <Step
              icon={<Link2 className="text-destructive h-5 w-5" />}
              label="Evaluate"
              sub="Kappa, F1, precision, recall"
              borderClass="border-destructive"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-center text-sm font-semibold">
              Orchestration &amp; Adjudication
            </h3>
            <div className="bg-sandpiper-surface space-y-3 rounded-lg p-4">
              <div className="flex justify-center gap-3">
                <LlmBox
                  label="GPT-4"
                  run="Run A"
                  runClass="text-green-700 bg-green-100"
                />
                <LlmBox
                  label="Gemini"
                  run="Run B"
                  runClass="text-blue-700 bg-blue-100"
                />
                <LlmBox
                  label="Claude"
                  run="Run C"
                  runClass="text-destructive bg-destructive/10"
                />
              </div>
              <div className="text-muted-foreground flex justify-center gap-8 text-xs">
                <span>▼</span>
                <span>▼</span>
                <span>▼</span>
              </div>
              <div className="bg-primary text-primary-foreground mx-auto max-w-[200px] rounded-md p-3 text-center">
                <p className="text-sm font-medium">Adjudication Engine</p>
                <p className="text-primary-foreground/70 text-xs">
                  Compare · Resolve · Consensus
                </p>
              </div>
              <div className="text-muted-foreground flex justify-center text-xs">
                <span>▼</span>
              </div>
              <div className="border-primary mx-auto max-w-[200px] rounded-md border-2 p-3 text-center">
                <p className="text-primary text-sm font-semibold">
                  Consensus Annotation
                </p>
                <p className="text-muted-foreground text-xs">
                  More reliable than any single model
                </p>
              </div>
              <div className="flex justify-center pt-1">
                <span className="bg-destructive rounded-full px-3 py-1 text-xs text-white">
                  15% more accurate vs. single-model
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-center text-sm font-semibold">
              See Sandpiper in Action
            </h3>
            <div className="bg-sandpiper-surface flex h-52 items-center justify-center rounded-lg">
              <div className="text-muted-foreground space-y-3 text-center">
                <div className="border-muted-foreground/40 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2">
                  <Play className="text-muted-foreground/60 ml-0.5 h-5 w-5" />
                </div>
                <p className="text-sm">Walkthrough video coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step({
  icon,
  label,
  sub,
  borderClass,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  borderClass: string;
}) {
  return (
    <div className="flex w-24 flex-col items-center gap-2 text-center">
      <div
        className={`h-14 w-14 rounded-full border-2 ${borderClass} flex items-center justify-center`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-muted-foreground text-xs leading-tight">{sub}</p>
    </div>
  );
}

function LlmBox({
  label,
  run,
  runClass,
}: {
  label: string;
  run: string;
  runClass: string;
}) {
  return (
    <div className="bg-background border-border min-w-[64px] rounded-md border p-2 text-center">
      <p className="text-sm font-medium">{label}</p>
      <span className={`rounded px-1.5 py-0.5 text-xs ${runClass}`}>{run}</span>
    </div>
  );
}
