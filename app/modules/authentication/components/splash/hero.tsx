import { GraduationCap } from "lucide-react";
import { Link } from "react-router";
import heroDemo from "~/assets/splash/hero-demo.mp4";

export function Hero() {
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
              <source src={heroDemo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
