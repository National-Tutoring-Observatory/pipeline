import sandpiperLogo from "~/assets/sandpiper-logo.svg";

export function Footer() {
  return (
    <footer className="bg-[#2C241B] py-8 text-[0.82rem] text-[rgba(255,255,255,0.5)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <img
                src={sandpiperLogo}
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
