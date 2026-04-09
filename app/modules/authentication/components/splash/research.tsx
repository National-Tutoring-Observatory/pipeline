function PaperCard({
  category,
  categoryColor,
  title,
  description,
  source,
  href,
}: {
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  source: string;
  href: string;
}) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-[#E6E2D6] bg-[#faf8f3] p-6">
      <div
        className="text-[0.65rem] font-bold tracking-[0.08em] uppercase opacity-70"
        style={{ color: categoryColor }}
      >
        {category}
      </div>
      <h5 className="font-display text-[1.05rem] leading-[1.4] text-[#2C241B]">
        {title}
      </h5>
      <p className="flex-1 text-[0.82rem] leading-[1.55] text-[#5D534A]">
        {description}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[0.72rem] text-[#5D534A] opacity-60">
          {source}
        </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.78rem] font-medium text-[#A64B2A] no-underline"
        >
          Read paper &rarr;
        </a>
      </div>
    </div>
  );
}

export function Research() {
  const sandpiperPapers = [
    {
      category: "LLM Orchestration",
      title:
        "AI Annotation Orchestration: Evaluating LLM Verifiers to Improve the Quality of LLM Annotations in Learning Analytics",
      description:
        "Ahtisham, Vanacore, Lee, Zhou, Pietrzak & Kizilcec demonstrate how orchestrating multiple LLMs with verification improves annotation quality.",
      source: "arXiv 2511.09785",
      href: "https://arxiv.org/abs/2511.09785",
    },
    {
      category: "LLM Reasoning",
      title:
        "LLM Reasoning Predicts When Models Are Right: Evidence from Coding Classroom Discourse",
      description:
        "Ahtisham, Vanacore, Zhou, Lee & Kizilcec show that LLM reasoning traces can predict annotation accuracy in classroom discourse coding tasks.",
      source: "arXiv 2602.09832",
      href: "https://arxiv.org/abs/2602.09832",
    },
    {
      category: "De-Identification",
      title:
        "Utility-Preserving De-Identification for Math Tutoring: Investigating Numeric Ambiguity in the MathEd-PII Benchmark Dataset",
      description:
        "Zhou, Vanacore, Ahtisham, Lee, Pietrzak, Hedley, Dias, Shaw, Sch\u00E4fer & Kizilcec address de-identifying math tutoring transcripts while preserving utility.",
      source: "arXiv 2602.16571",
      href: "https://arxiv.org/abs/2602.16571",
    },
    {
      category: "Foundation Model Baselines",
      title:
        "How Well Do Large Language Models Recognize Instructional Moves? Establishing Baselines for Foundation Models in Educational Discourse",
      description:
        "Vanacore & Kizilcec establish baseline performance benchmarks for foundation models on educational discourse annotation tasks.",
      source: "arXiv 2512.19903",
      href: "https://arxiv.org/abs/2512.19903",
    },
  ];

  const foundationalPapers = [
    {
      category: "LLM Annotation Quality",
      title: "ChatGPT Outperforms Crowd Workers for Text-Annotation Tasks",
      description:
        "Gilardi, Alizadeh & Kubli (2023) demonstrated that GPT-4 outperforms crowd-sourced human annotators on multiple text classification tasks, with higher accuracy and intercoder agreement \u2014 at a fraction of the cost.",
      source: "Proceedings of the National Academy of Sciences",
      href: "https://doi.org/10.1073/pnas.2305016120",
    },
    {
      category: "Multi-Model Orchestration",
      title:
        "AnnoLLM: Making Large Language Models to Be Better Crowdsourced Annotators",
      description:
        "He et al. (2024) showed that LLMs can serve as effective annotation models when combined with careful prompt engineering and self-consistency checks \u2014 the foundation of Sandpiper\u2019s orchestration approach.",
      source: "ACL 2024",
      href: "https://doi.org/10.48550/arXiv.2303.16854",
    },
    {
      category: "Inter-Rater Reliability",
      title: "The Measurement of Observer Agreement for Categorical Data",
      description:
        "Landis & Koch (1977) established the foundational interpretation benchmarks for Cohen\u2019s Kappa that Sandpiper uses to evaluate annotation quality \u2014 where \u03BA \u2265 0.81 indicates \u201Calmost perfect\u201D agreement.",
      source: "Biometrics, 33(1), 159\u2013174",
      href: "https://doi.org/10.2307/2529310",
    },
    {
      category: "LLM Adjudication",
      title:
        "Can Large Language Models Provide Useful Feedback on Research Papers?",
      description:
        "Liang et al. (2023) found that LLM-generated evaluations substantially overlap with human expert judgments, supporting the use of multi-model adjudication to improve reliability of automated assessments.",
      source: "arXiv preprint",
      href: "https://doi.org/10.48550/arXiv.2310.01783",
    },
  ];

  return (
    <section id="research" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#A64B2A] uppercase">
            Research
          </div>
          <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em] text-[#2C241B]">
            Built on Peer-Reviewed Science
          </h2>
          <p className="mx-auto max-w-[640px] text-[1.05rem] leading-[1.7] text-[#5D534A]">
            Sandpiper&rsquo;s design decisions are grounded in published
            research on LLM annotation, inter-rater reliability, and
            orchestration strategies.
          </p>
        </div>

        <div className="mb-12">
          <h4 className="font-display mb-5 text-[1rem] font-semibold tracking-[0.06em] text-[#367181] uppercase">
            From the Sandpiper Team
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {sandpiperPapers.map((paper) => (
              <PaperCard key={paper.href} categoryColor="#367181" {...paper} />
            ))}
          </div>
        </div>

        <h4 className="font-display mb-5 text-[1rem] font-semibold tracking-[0.06em] text-[#5D534A] uppercase">
          Foundational Research
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          {foundationalPapers.map((paper) => (
            <PaperCard key={paper.href} categoryColor="#A64B2A" {...paper} />
          ))}
        </div>
      </div>
    </section>
  );
}
