import { Link } from "react-router";

export function Benefits() {
  const stats = [
    {
      number: "Deep",
      color: "#D8654F",
      label: "Utterance-Level Analysis",
      description:
        "Go beyond surface metrics. Annotate individual utterances with custom coding schemes \u2014 capturing nuanced behaviors, interaction patterns, and discourse structures at scale.",
    },
    {
      number: "1000s",
      color: "#D4A843",
      label: "Transcripts in Hours, Not Days",
      description:
        "Traditional qualitative coding takes weeks for even modest samples. Sandpiper leverages orchestrated LLMs to process thousands of documents in days \u2014 what used to take a team of human coders months.",
    },
    {
      number: "\u03BA 0.80+",
      color: "#e8f4f7",
      label: "Industry Standard Reliability",
      description:
        "Speed doesn't mean sacrificing rigor. Built-in evaluation metrics prove your AI annotations meet the inter-rater reliability thresholds required by peer-reviewed journals.",
    },
  ];

  return (
    <section
      id="benefits"
      className="relative overflow-hidden py-22 text-white"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #2C241B 0%, #3a3125 50%, #2f3a35 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 10% 20%, rgba(166,75,42,0.12), transparent), radial-gradient(ellipse 500px 500px at 90% 80%, rgba(54,113,129,0.1), transparent)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#D4A843] uppercase">
            Why Sandpiper
          </div>
          <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em]">
            Annotation Research,
            <br />
            Reimagined
          </h2>
          <p className="mx-auto max-w-[620px] text-[1.05rem] leading-[1.7] text-white/50">
            Traditional qualitative coding is slow, expensive, and hard to
            scale. Sandpiper changes that &mdash; using orchestrated LLMs to
            annotate textual data at the utterance and session level, then
            validating results with industry standard statistical metrics.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-white/4 p-10 text-center backdrop-blur-[12px] transition-all hover:-translate-y-1 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.08)]"
            >
              <div
                className="font-display mb-2 text-5xl leading-none font-bold"
                style={{
                  color: stat.color,
                }}
              >
                {stat.number}
              </div>
              <div className="mb-1 text-[0.95rem] font-semibold">
                {stat.label}
              </div>
              <div className="text-[0.85rem] leading-relaxed text-white/55">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="rounded-[0.625rem] bg-[#367181] px-7 py-3 text-lg font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Annotating
          </Link>
        </div>
      </div>
    </section>
  );
}
