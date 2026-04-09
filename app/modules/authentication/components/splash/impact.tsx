import { BookOpen, Building, Heart, Mail, Users } from "lucide-react";

export function Impact() {
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
