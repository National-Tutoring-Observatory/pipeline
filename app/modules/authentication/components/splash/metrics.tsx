import { CheckCircle } from "lucide-react";
import screenshotEvaluation from "~/assets/splash/screenshot-evaluation.webp";

export function Metrics() {
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
              src={screenshotEvaluation}
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
