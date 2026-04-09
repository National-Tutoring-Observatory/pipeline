import { Link } from "react-router";
import { GithubIcon } from "./githubIcon";

export function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-20 text-white"
      style={{
        background:
          "linear-gradient(135deg, #A64B2A 0%, #D8654F 50%, #D4A843 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display mb-3 text-[clamp(1.6rem,3vw,2.4rem)] font-bold">
          The Future of Annotation Research Starts Here
        </h2>
        <p className="mx-auto mb-8 max-w-[560px] text-[1.05rem] text-white/80">
          Sandpiper is free, open-source, and ready to use. Upload your data,
          orchestrate AI annotations across multiple models, and get industry
          standard evaluation metrics &mdash; all in one sitting.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-[0.625rem] bg-white px-8 py-3 font-bold text-[#A64B2A] no-underline transition-all hover:-translate-y-0.5 hover:text-[#8B3D21] hover:shadow-lg"
          >
            Try Sandpiper Now
          </Link>
          <a
            href="https://github.com/National-Tutoring-Observatory/sandpiper"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[0.625rem] border-2 border-[rgba(255,255,255,0.5)] bg-transparent px-6 py-3 font-semibold text-white no-underline transition-all hover:border-white hover:bg-[rgba(255,255,255,0.12)]"
          >
            <GithubIcon size={16} />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
