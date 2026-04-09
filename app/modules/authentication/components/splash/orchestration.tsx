import { ChevronRight, Trophy } from "lucide-react";
import { Link } from "react-router";

export function Orchestration() {
  const orchSteps = [
    {
      num: "1",
      numBg: "rgba(179,27,27,0.25)",
      numColor: "#e84040",
      title: "Multi-Model Runs",
      description:
        "Run the same coding scheme across GPT, Gemini, and Claude simultaneously. Each model annotates every utterance independently.",
    },
    {
      num: "2",
      numBg: "rgba(54,113,129,0.25)",
      numColor: "#e8f4f7",
      title: "Cross-Model Comparison",
      description:
        "Sandpiper compares annotations across models, identifying agreement patterns and flagging divergences for adjudication.",
    },
    {
      num: "3",
      numBg: "rgba(212,168,67,0.2)",
      numColor: "#D4A843",
      title: "Consensus Adjudication",
      description:
        "A final adjudication pass synthesizes the strongest annotations into a consensus label set that exceeds any single model's accuracy.",
    },
  ];

  return (
    <section
      id="orchestration"
      className="relative overflow-hidden py-24 text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 700px 500px at 20% 30%, rgba(179,27,27,0.12), transparent), radial-gradient(ellipse 600px 400px at 80% 70%, rgba(54,113,129,0.08), transparent), linear-gradient(160deg, #1a0f0a 0%, #2C241B 40%, #1e2a28 100%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.16em] text-[#B31B1B] uppercase">
            LLM Orchestration &amp; Adjudication
          </div>
          <h2 className="font-display mb-4 text-[clamp(2rem,3.8vw,2.8rem)] leading-[1.15] font-bold">
            Surpass Human-Level Annotation Quality
          </h2>
          <p className="mx-auto max-w-[680px] text-[1.05rem] leading-[1.75] text-white/55">
            Sandpiper doesn&rsquo;t just run a single model and hope for the
            best. It orchestrates multiple LLMs across the same data, then uses
            adjudication logic to synthesize a consensus annotation that
            consistently outperforms any individual model &mdash; and
            significantly enhances gold-label human coders.
          </p>
        </div>

        <div className="my-12 flex flex-col md:flex-row">
          {orchSteps.map((step, index) => (
            <div key={step.title} className="flex flex-1 items-stretch">
              <div
                className="flex-1 border border-[rgba(255,255,255,0.06)] bg-white/3 p-8 backdrop-blur-[8px] transition-all hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.06)]"
                style={{
                  borderRadius:
                    index === 0
                      ? "1rem 0 0 1rem"
                      : index === orchSteps.length - 1
                        ? "0 1rem 1rem 0"
                        : "0",
                }}
              >
                <div
                  className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[0.78rem] font-extrabold"
                  style={{ background: step.numBg, color: step.numColor }}
                >
                  {step.num}
                </div>
                <h5 className="mb-1 text-[0.95rem] font-bold">{step.title}</h5>
                <p className="m-0 text-[0.82rem] leading-relaxed text-white/50">
                  {step.description}
                </p>
              </div>
              {index < orchSteps.length - 1 && (
                <div className="hidden items-center px-1 text-[rgba(255,255,255,0.15)] md:flex">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              className="flex h-full flex-col justify-center rounded-2xl border border-[rgba(179,27,27,0.2)] p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(179,27,27,0.15), rgba(179,27,27,0.05))",
              }}
            >
              <h4 className="font-display mb-2 text-[1.3rem] font-bold">
                <Trophy size={18} className="mr-2 inline text-[#D4A843]" />
                Why This Matters
              </h4>
              <p className="m-0 text-[0.92rem] leading-[1.7] text-white/55">
                Traditional annotation pipelines rely on a single LLM pass or
                expensive human coding teams. Sandpiper&rsquo;s orchestration
                approach treats LLMs the way research teams treat human coders
                &mdash; by using multiple independent annotators and resolving
                disagreements through structured adjudication. The result is
                annotation quality that rivals or exceeds carefully trained
                human coders, at a fraction of the cost and time.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="h-full rounded-xl bg-[#2C241B] p-5 text-center">
              <div className="mb-4 text-[0.78rem] font-bold text-white">
                Achieving Reliable Results with Sandpiper 1.0
              </div>
              {/* Chart area: Y-axis + bars */}
              <div className="flex items-stretch gap-2">
                {/* Y-axis */}
                <div className="flex shrink-0 items-stretch gap-1">
                  <div className="flex w-4 items-center justify-center">
                    <span
                      className="text-[0.48rem] font-semibold whitespace-nowrap text-white/50"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      Average Performance (Cohen&apos;s κ)
                    </span>
                  </div>
                  <div className="flex w-6 flex-col justify-between py-0.5 text-right">
                    {[
                      "0.8",
                      "0.7",
                      "0.6",
                      "0.5",
                      "0.4",
                      "0.3",
                      "0.2",
                      "0.1",
                      "0.0",
                    ].map((tick) => (
                      <span key={tick} className="text-[0.48rem] text-white/40">
                        {tick}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Grid + bars */}
                <div className="relative flex flex-1 flex-col">
                  {/* Horizontal grid lines */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-0.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="h-px w-full bg-white/10" />
                    ))}
                  </div>
                  {/* Bars row — 3 bars; badge is an absolute overlay */}
                  <div className="relative flex h-[160px] items-end justify-around px-2">
                    {/* Bar 1: AI Chat Interface */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-[0.65rem] font-bold text-[#D4A843]">
                        Fail
                      </span>
                      <div className="h-[2px] w-12 rounded-t bg-[#367181] opacity-30" />
                    </div>
                    {/* Bar 2: Basic LLM API Call — 0.32/0.8 × 160px = 64px */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-[0.65rem] font-bold text-[#D4A843]">
                        0.32
                      </span>
                      <div className="h-[64px] w-12 rounded-t bg-[#367181]" />
                    </div>
                    {/* Bar 3: Sandpiper 1.0 — 0.73/0.8 × 160px = 146px */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-[0.65rem] font-extrabold text-[#D4A843]">
                        0.73
                      </span>
                      <div className="h-[146px] w-12 rounded-t bg-[#A64B2A]" />
                    </div>
                    {/*
                      Badge + brace — flex row so badge and bracket lines connect
                      Bar3 top: 14px from chart top, Bar2 top: 96px → height 82px
                    */}
                    <div
                      className="pointer-events-none absolute flex items-center"
                      style={{ left: "57%", top: 14, height: 82 }}
                    >
                      {/* Badge — shrinks to content width */}
                      <div className="shrink-0 rounded border border-[#D4A843]/60 bg-[#2C1F0F] px-1.5 py-0.5 text-center">
                        <div className="text-[0.7rem] font-extrabold text-[#D4A843]">
                          130%
                        </div>
                        <div className="text-[0.44rem] leading-tight font-bold text-[#D4A843]">
                          Increase in
                          <br />
                          Performance
                        </div>
                      </div>
                      {/* Bracket — fills space between badge and bar3 */}
                      <div className="relative ml-2 flex-1 self-stretch">
                        {/* Vertical line (bar3 side) */}
                        <div className="absolute inset-y-0 left-0 w-px bg-[#D4A843]/60" />

                        {/* Top arm at bar3 top level */}
                        <div className="absolute inset-x-0 top-0 h-px w-2 bg-[#D4A843]/60" />

                        {/* Mid arm — midpoint of 82px bracket, sticks left toward badge */}
                        <div className="absolute top-[41px] h-px w-2 -translate-x-full bg-[#D4A843]/60" />

                        {/* Bottom arm at bar2 top level */}
                        <div className="absolute inset-x-0 bottom-0 h-px w-2 bg-[#D4A843]/60" />
                      </div>
                    </div>
                  </div>
                  {/* X-axis baseline */}
                  <div className="h-px w-full bg-white/20" />
                  {/* X-axis labels — 3 items matching justify-around above */}
                  <div className="mt-2 flex items-start justify-around px-2">
                    <span className="w-14 text-center text-[0.48rem] leading-tight font-semibold text-white/50">
                      AI Chat Interface
                    </span>
                    <span className="w-14 text-center text-[0.48rem] leading-tight font-semibold text-white/50">
                      Basic LLM API Call
                    </span>
                    <span className="w-14 text-center text-[0.48rem] leading-tight font-bold text-white">
                      Sandpiper 1.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center rounded-[0.625rem] bg-white px-7 py-3 font-semibold text-[#B31B1B] no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Try Orchestrated Annotation
          </Link>
        </div>
      </div>
    </section>
  );
}
