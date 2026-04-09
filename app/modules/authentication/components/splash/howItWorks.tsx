import { Bot, CloudUpload, TrendingUp } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router";

export function HowItWorks() {
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
