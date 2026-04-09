import { GithubIcon } from "./githubIcon";

export function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-22 text-white"
      style={{
        background:
          "linear-gradient(135deg, #2C241B 0%, #322b22 40%, #2a3530 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 80% 20%, rgba(179,27,27,0.06), transparent), radial-gradient(ellipse 500px 400px at 20% 80%, rgba(54,113,129,0.08), transparent)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="lg:w-[60%]">
            <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#D4A843] uppercase">
              About the Project
            </div>
            <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em]">
              A National Tutoring Observatory Initiative
            </h2>
            <p className="mb-4 text-base leading-[1.8] text-white/60">
              Sandpiper is developed as part of the{" "}
              <a
                href="https://nationaltutoringobservatory.org"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4A843] underline hover:text-[#e8c060]"
              >
                National Tutoring Observatory
              </a>
              , a collaborative research initiative led by{" "}
              <a
                href="https://bowers.cornell.edu"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4A843] underline hover:text-[#e8c060]"
              >
                Cornell Bowers CIS
              </a>{" "}
              in partnership with the{" "}
              <a
                href="https://tsl.mit.edu/"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4A843] underline hover:text-[#e8c060]"
              >
                MIT Teaching Systems Lab
              </a>{" "}
              and{" "}
              <a
                href="https://www.cmu.edu"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4A843] underline hover:text-[#e8c060]"
              >
                Carnegie Mellon University
              </a>
              . The NTO&rsquo;s mission is to improve teaching and learning at
              scale by creating the world&rsquo;s largest repository of tutoring
              interaction data &mdash; the Million Tutor Moves dataset.
            </p>
            <p className="mb-4 text-base leading-[1.8] text-white/60">
              The application&rsquo;s design and engineering is led by{" "}
              <a
                href="https://freshcognate.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4A843] underline hover:text-[#e8c060]"
              >
                FreshCognate
              </a>
              , an educational strategy, instructional design, and media company
              with deep expertise in learning technology and data-driven
              storytelling.
            </p>
            <p className="mt-6 text-[0.85rem] text-white/45">
              This material is based upon work supported by the National Science
              Foundation (Grant No. 2321499), the Gates Foundation, and the Chan
              Zuckerberg Initiative.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8">
              <a
                href="https://bowers.cornell.edu"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/assets/splash/cornell-bowers-white.svg"
                  alt="Cornell Bowers CIS"
                  className="h-9 opacity-60 transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              </a>
              <a
                href="https://freshcognate.com"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/assets/splash/freshcognate-white.webp"
                  alt="FreshCognate"
                  className="h-9 opacity-60 transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              </a>
              <a
                href="https://nationaltutoringobservatory.org"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/assets/splash/nto-logo.webp"
                  alt="National Tutoring Observatory"
                  className="h-9 opacity-60 invert transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              </a>
              <a href="https://tsl.mit.edu/" target="_blank" rel="noreferrer">
                <img
                  src="/assets/splash/mit-tsl.webp"
                  alt="MIT Teaching Systems Lab"
                  className="h-9 opacity-60 invert transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              </a>
              <a
                href="https://www.cmu.edu"
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.8rem] font-semibold text-white/80 opacity-60 transition-opacity hover:opacity-100"
              >
                Carnegie Mellon University
              </a>
            </div>
          </div>
          <div className="text-center text-2xl lg:w-[40%]">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-white/4 p-10 backdrop-blur-[8px] transition-colors hover:border-[rgba(255,255,255,0.15)]">
              <GithubIcon
                size={64}
                className="mx-auto mb-5 block text-[#D4A843]"
              />
              <h4 className="font-display mb-2 font-bold">Open Source</h4>
              <p className="mb-6 text-[0.9rem] leading-[1.65] text-white/45">
                Sandpiper is open-source and freely available. We believe in
                equitable access to high-quality research tools.
              </p>
              <a
                href="https://github.com/National-Tutoring-Observatory/sandpiper"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-[0.625rem] border-2 border-[rgba(255,255,255,0.5)] bg-transparent px-5 py-2.5 text-sm font-semibold text-white no-underline transition-all hover:border-white hover:bg-[rgba(255,255,255,0.12)]"
              >
                <GithubIcon size={16} />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
