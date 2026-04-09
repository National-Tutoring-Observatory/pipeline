import {
  BarChart3,
  BookOpen,
  Bot,
  Building,
  CheckCircle,
  ChevronRight,
  CloudUpload,
  FileText,
  GraduationCap,
  Heart,
  Mail,
  Menu,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Fragment, useState } from "react";
import { Link } from "react-router";

function GithubIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AnnouncementBanner() {
  return (
    <div className="fixed top-0 right-0 left-0 z-[60] bg-[#367181] py-2 text-center">
      <span className="text-[0.82rem] font-semibold tracking-[0.02em] text-white">
        🎁 New users get <strong>$20 in free credits</strong> to start
        annotating
      </span>
    </div>
  );
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Why Sandpiper", href: "#benefits" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Orchestration", href: "#orchestration" },
    { label: "Evaluation", href: "#metrics" },
    { label: "Research", href: "#research" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-[32px] right-0 left-0 z-50 border-b border-[rgba(230,226,214,0.6)] bg-[#f9f7f1]/82 backdrop-blur-[20px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="#hero"
            className="font-display flex items-center gap-2 text-[1.3rem] font-bold text-[#2C241B] no-underline"
          >
            <img
              src="/assets/sandpiper-logo.svg"
              alt="Sandpiper"
              className="h-[50px] w-[50px]"
            />
            Sandpiper
          </a>

          <div className="hidden items-center gap-6 lg:mr-6 lg:ml-auto lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.88rem] font-medium text-[#5D534A] no-underline transition-colors hover:text-[#B31B1B]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/signup"
              className="rounded-[0.625rem] bg-[#367181] px-4 py-2 text-sm font-semibold text-white no-underline transition-all hover:bg-[#2a5a68]"
            >
              Open App
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="cursor-pointer border-none bg-transparent text-[#2C241B] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E6E2D6] py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.88rem] font-medium text-[#5D534A] no-underline transition-colors hover:text-[#B31B1B]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2">
                <Link
                  to="/signup"
                  className="inline-block rounded-[0.625rem] bg-[#367181] px-4 py-2 text-sm font-semibold text-white no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Open App
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center overflow-hidden pt-36 pb-10 lg:pt-44 lg:pb-20 [@media(min-height:900px)]:min-h-0 [@media(min-height:900px)]:flex-1"
      style={{
        background:
          "linear-gradient(170deg, #F9F7F1 0%, #f0ece0 40%, #e8ddd0 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="lg:w-[40%]">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[rgba(166,75,42,0.12)] bg-[#e8f4f7] px-4 py-1.5 text-[0.78rem] font-semibold tracking-[0.03em] text-[#367181]">
              <GraduationCap size={14} />A National Tutoring Observatory Project
            </div>
            <h1 className="font-display mb-4 text-[clamp(2.4rem,5vh,4.5rem)] leading-[1.1] font-bold tracking-[-0.02em] text-[#2C241B]">
              The Future of Discourse
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #B31B1B, #D8654F)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Annotation
              </span>
            </h1>
            <p className="mb-4 max-w-[520px] text-[clamp(1.12rem,1.8vh,1.35rem)] leading-[1.75] text-[#5D534A]">
              Sandpiper orchestrates multiple LLMs to produce reliable, highly
              accurate annotations at scale. Starting with tutoring transcripts,
              built for any field.
            </p>
            <div
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-[#367181] py-[0.45rem] pr-[1.1rem] pl-[0.7rem]"
              style={{ background: "rgba(54,113,129,0.08)" }}
            >
              <span className="rounded-full bg-[#367181] px-2.5 py-1 text-[1.1rem] leading-none font-extrabold text-white">
                130%
              </span>
              <span className="text-[0.88rem] font-semibold text-[#2C241B]">
                better performance than an AI chat interface
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="rounded-[0.625rem] bg-[#A64B2A] px-7 py-3 font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-[#8B3D21] hover:shadow-lg"
              >
                Try Sandpiper Now
              </Link>
              <a
                href="#how-it-works"
                className="rounded-[0.625rem] border-2 border-[#367181] bg-transparent px-6 py-3 font-semibold text-[#367181] no-underline transition-all hover:bg-[#367181] hover:text-white"
              >
                See How It Works
              </a>
            </div>
          </div>
          <div className="lg:w-[60%]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            >
              <source src="/assets/splash/hero-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

function Partners() {
  const partners = [
    {
      name: "National Tutoring Observatory",
      src: "/assets/splash/nto-logo.webp",
      href: "https://nationaltutoringobservatory.org",
      className: "h-[54px] max-w-[180px]",
    },
    {
      name: "Cornell Bowers CIS",
      src: "/assets/splash/cornell-bowers.svg",
      href: "https://bowers.cornell.edu",
      className: "h-[44px] max-w-[200px]",
    },
    {
      name: "MIT Teaching Systems Lab",
      src: "/assets/splash/mit-tsl.webp",
      href: "https://tsl.mit.edu/",
      className: "h-[60px] max-w-[220px]",
    },
    {
      name: "Carnegie Mellon University",
      href: "https://www.cmu.edu",
      isText: true,
    },
    {
      name: "FreshCognate",
      src: "/assets/splash/freshcognate.webp",
      href: "https://freshcognate.com",
      className: "h-[44px] max-w-[180px]",
    },
  ];

  return (
    <section
      id="partners"
      className="border-t border-b border-[#E6E2D6] bg-white py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl bg-[rgba(255,255,255,0.85)] px-10 py-5 shadow-sm backdrop-blur-sm lg:gap-12">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 items-center justify-center"
            >
              {partner.isText ? (
                <span className="max-w-[253px] text-center text-sm font-semibold text-[#5D534A] opacity-75 transition-opacity hover:opacity-100">
                  Carnegie Mellon University
                </span>
              ) : (
                <img
                  src={partner.src}
                  alt={partner.name}
                  className={`object-contain opacity-75 grayscale-[20%] transition-all hover:opacity-100 hover:grayscale-0 ${partner.className}`}
                  loading="lazy"
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
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

function Features() {
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
        "Compare runs with Cohen's Kappa, Precision, Recall, and F1 \u2014 with pairwise heatmaps and top-performer rankings.",
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

function HowItWorks() {
  const steps = [
    {
      icon: <CloudUpload size={22} />,
      gradient: "linear-gradient(135deg, #A64B2A, #D8654F)",
      title: "Upload & Organize",
      description:
        "Import your transcript or text files into a project. Sandpiper automatically converts them into structured sessions.",
    },
    {
      icon: <Bot size={22} />,
      gradient: "linear-gradient(135deg, #367181, #5B9BD5)",
      title: "Annotate with AI",
      description:
        "Select a prompt and LLM model, then launch an annotation run. Try multiple configurations to find the best results.",
    },
    {
      icon: <TrendingUp size={22} />,
      gradient: "linear-gradient(135deg, #7A9E7E, #367181)",
      title: "Evaluate & Compare",
      description:
        "Group runs into Run Sets and instantly see Kappa agreement, precision/recall, and which prompt-model pair performs best.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-22"
      style={{
        background:
          "linear-gradient(170deg, #ede8dc 0%, #E6E2D6 50%, #ddd8ca 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#A64B2A] uppercase">
            How It Works
          </div>
          <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em] text-[#2C241B]">
            Three Steps to Validated Insights
          </h2>
        </div>
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center md:gap-0">
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              <div className="z-10 w-full text-center md:max-w-[260px]">
                <div
                  className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-md"
                  style={{ background: step.gradient }}
                >
                  {step.icon}
                </div>
                <h5 className="mb-1.5 text-[1.05rem] font-bold text-[#2C241B]">
                  {step.title}
                </h5>
                <p className="mx-auto max-w-[240px] text-[0.88rem] leading-[1.65] text-[#5D534A]">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden shrink-0 items-start px-4 pt-[25px] opacity-30 md:flex">
                  <div
                    className="relative h-[2px] w-[60px] after:absolute after:top-[-4px] after:right-[-4px] after:h-[10px] after:w-[10px] after:rotate-45 after:border-t-2 after:border-r-2 after:border-[#367181] after:content-['']"
                    style={{
                      background: "linear-gradient(90deg, #A64B2A, #367181)",
                    }}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="rounded-[0.625rem] bg-[#A64B2A] px-7 py-3 font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-[#8B3D21] hover:shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </section>
  );
}

function Orchestration() {
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

function Metrics() {
  const checkItems = [
    {
      bold: "Cohen\u2019s Kappa",
      text: " \u2014 pairwise agreement beyond chance",
    },
    {
      bold: "Precision & Recall",
      text: " \u2014 accuracy against human labels",
    },
    { bold: "F1 Score", text: " \u2014 balanced classification metric" },
    {
      bold: "Agreement Heatmaps",
      text: " \u2014 visual pairwise comparisons",
    },
    {
      bold: "Top Performer Rankings",
      text: " \u2014 find the best configuration fast",
    },
  ];

  return (
    <section id="metrics" className="bg-white py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="lg:w-5/12">
            <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#367181] uppercase">
              Evaluation Engine
            </div>
            <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em] text-[#2C241B]">
              Know Exactly How Good Your Annotations Are
            </h2>
            <p className="mb-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-[#5D534A]">
              Don&rsquo;t just annotate &mdash; validate. Sandpiper computes
              rigorous inter-rater metrics so you can confidently report results
              in papers, grants, and presentations.
            </p>
            <div className="space-y-1">
              {checkItems.map((item) => (
                <div
                  key={item.bold}
                  className="flex items-center gap-2 text-[0.92rem] leading-[2.4] text-[#5D534A]"
                >
                  <CheckCircle size={16} className="shrink-0 text-[#367181]" />
                  <span>
                    <strong>{item.bold}</strong>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-7/12">
            <img
              src="/assets/splash/screenshot-evaluation.webp"
              alt="Evaluation metrics dashboard"
              className="w-full rounded-2xl border border-[#E6E2D6] shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

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

function Research() {
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

function About() {
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

function Impact() {
  const impacts = [
    {
      icon: <Users size={18} />,
      iconBg: "rgba(166,75,42,0.1)",
      iconColor: "#A64B2A",
      title: "Research Teams",
      description:
        "Replace slow, manual coding with orchestrated AI annotation that meets publication standards \u2014 freeing your team to focus on analysis, not labeling.",
    },
    {
      icon: <BookOpen size={18} />,
      iconBg: "rgba(54,113,129,0.1)",
      iconColor: "#367181",
      title: "Education Programs",
      description:
        "Understand which specific behaviors drive student growth, enabling targeted professional development grounded in evidence from real interactions.",
    },
    {
      icon: <Building size={18} />,
      iconBg: "rgba(122,158,126,0.12)",
      iconColor: "#7A9E7E",
      title: "Institutions",
      description:
        "Get deeper, data-driven insights about program investments \u2014 understanding not just whether interventions work, but what makes them effective.",
    },
    {
      icon: <Heart size={18} />,
      iconBg: "rgba(212,168,67,0.12)",
      iconColor: "#D4A843",
      title: "Funders",
      description:
        "Support scaling the infrastructure that transforms qualitative research from anecdote-driven to evidence-based \u2014 across any domain.",
    },
  ];

  return (
    <section
      id="impact"
      className="relative overflow-hidden py-22"
      style={{
        background:
          "linear-gradient(170deg, #F9F7F1 0%, #f0ece0 50%, #E6E2D6 100%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[0.72rem] font-bold tracking-[0.14em] text-[#A64B2A] uppercase">
            Impact &amp; Partnership
          </div>
          <h2 className="font-display text-section-heading mb-4 leading-[1.15] font-bold tracking-[-0.01em] text-[#2C241B]">
            Insights That Drive
            <br />
            Better Outcomes
          </h2>
          <p className="mx-auto max-w-[620px] text-[1.05rem] leading-[1.7] text-[#5D534A]">
            When annotation research is faster, cheaper, and more reliable,
            everyone benefits &mdash; from researchers to practitioners to the
            communities they serve.
          </p>
        </div>
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {impacts.map((impact) => (
            <div
              key={impact.title}
              className="rounded-2xl border border-[#E6E2D6] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[0.65rem]"
                style={{
                  background: impact.iconBg,
                  color: impact.iconColor,
                }}
              >
                {impact.icon}
              </div>
              <h5 className="mb-1.5 text-[1rem] font-bold text-[#2C241B]">
                {impact.title}
              </h5>
              <p className="m-0 text-[0.86rem] leading-[1.65] text-[#5D534A]">
                {impact.description}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="mx-auto mb-6 max-w-[640px] text-base leading-[1.7] text-[#5D534A]">
            We are actively seeking partnerships with tutoring providers,
            researchers, school districts, and funders who want to support this
            effort.
          </p>
          <a
            href="mailto:sandpipersupport@cornell.edu"
            className="inline-flex items-center gap-2 rounded-[0.625rem] border-none bg-[#A64B2A] px-7 py-3 font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:bg-[#8B3D21] hover:shadow-lg"
          >
            <Mail size={16} />
            Partner With Us
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
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

function Footer() {
  return (
    <footer className="bg-[#2C241B] py-8 text-[0.82rem] text-[rgba(255,255,255,0.5)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <img
                src="/assets/sandpiper-logo.svg"
                alt="Sandpiper"
                className="h-5 w-5 rounded-sm opacity-70"
              />
              <span className="font-display font-semibold text-white/60">
                Sandpiper
              </span>
            </div>
            <span>
              &copy; 2026 National Tutoring Observatory &middot; Cornell
              University
            </span>
          </div>
          <div className="flex gap-6">
            <a
              href="#hero"
              className="text-[rgba(255,255,255,0.55)] no-underline transition-colors hover:text-[#D4A843]"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-[rgba(255,255,255,0.55)] no-underline transition-colors hover:text-[#D4A843]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[rgba(255,255,255,0.55)] no-underline transition-colors hover:text-[#D4A843]"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-[rgba(255,255,255,0.55)] no-underline transition-colors hover:text-[#D4A843]"
            >
              About
            </a>
          </div>
          <div>
            <span>Built by </span>
            <a
              href="https://freshcognate.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#D4A843] no-underline"
            >
              FreshCognate
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Splash() {
  return (
    <div className="min-h-screen font-sans text-[#2C241B]">
      <AnnouncementBanner />
      <Navbar />
      <div className="flex flex-col [@media(min-height:900px)]:min-h-svh">
        <Hero />
        <Partners />
      </div>
      <Benefits />
      <Features />
      <HowItWorks />
      <Orchestration />
      <Metrics />
      <Research />
      <About />
      <Impact />
      <CTASection />
      <Footer />
    </div>
  );
}
