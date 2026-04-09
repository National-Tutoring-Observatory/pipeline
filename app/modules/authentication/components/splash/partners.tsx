export function Partners() {
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
