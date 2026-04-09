import { BarChart3, Bot, FileText, Users } from "lucide-react";

export function Features() {
  const features = [
    {
      colorTop: "#D8654F",
      iconBg: "rgba(216,101,79,0.1)",
      iconColor: "#D8654F",
      icon: <FileText size={22} />,
      title: "Transcript Ingestion",
      description:
        "Upload CSV, JSON, JSONL, or VTT files. Sandpiper normalizes and converts them into structured sessions ready for annotation.",
    },
    {
      colorTop: "#367181",
      iconBg: "rgba(54,113,129,0.1)",
      iconColor: "#367181",
      icon: <Bot size={22} />,
      title: "LLM Annotation",
      description:
        "Run custom prompts against GPT, Gemini, or Claude. Annotate per-utterance or per-session with any coding scheme you design.",
    },
    {
      colorTop: "#7A9E7E",
      iconBg: "rgba(122,158,126,0.12)",
      iconColor: "#7A9E7E",
      icon: <BarChart3 size={22} />,
      title: "Evaluation Metrics",
      description:
        "Compare runs with Cohen\u2019s Kappa, Precision, Recall, and F1 \u2014 with pairwise heatmaps and top-performer rankings.",
    },
    {
      colorTop: "#D4A843",
      iconBg: "rgba(212,168,67,0.12)",
      iconColor: "#D4A843",
      icon: <Users size={22} />,
      title: "Team Collaboration",
      description:
        "Organize work into team-based projects. Control access, share prompts, and export results for external analysis or publication.",
    },
  ];

  return (
    <section id="features" className="bg-[#F9F7F1] py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#A64B2A] uppercase">
            Features
          </div>
          <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em] text-[#2C241B]">
            Everything You Need to
            <br />
            Annotate &amp; Validate
          </h2>
          <p className="mx-auto max-w-[620px] text-[1.05rem] leading-[1.7] text-[#5D534A]">
            From raw text files to publication-ready evaluation reports,
            Sandpiper handles the entire annotation research pipeline.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-[#E6E2D6] bg-white p-8 transition-all hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div
                className="absolute top-0 right-0 left-0 h-[3px] rounded-t-2xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: feature.colorTop }}
              />
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: feature.iconBg,
                  color: feature.iconColor,
                }}
              >
                {feature.icon}
              </div>
              <h5 className="mb-1.5 text-[1.05rem] font-bold text-[#2C241B]">
                {feature.title}
              </h5>
              <p className="m-0 text-[0.88rem] leading-[1.65] text-[#5D534A]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        <div className="relative mx-auto mt-16 h-[560px] max-w-5xl">
          <img
            src="/assets/splash/screenshot-runset-creator.webp"
            alt="Run Set Creator"
            className="absolute left-0 w-[62%] -rotate-2 rounded-xl border border-[rgba(0,0,0,0.05)] shadow-xl"
            loading="lazy"
          />
          <img
            src="/assets/splash/screenshot-runset-overview.webp"
            alt="Run Set Overview"
            className="absolute top-[40px] left-[28%] z-10 w-[62%] rotate-[1.5deg] rounded-xl border border-[rgba(0,0,0,0.05)] shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
