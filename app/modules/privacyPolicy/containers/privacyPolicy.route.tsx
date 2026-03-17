import { Link } from "react-router";

export default function PrivacyPolicyRoute() {
  return (
    <div
      className="flex min-h-screen w-screen justify-center"
      style={{ backgroundColor: "#f7f7f7" }}
    >
      <div className="w-full max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/assets/nto-logo-icon.png"
            alt="NTO Logo"
            className="w-10"
          />
          <Link
            to="/"
            className="text-muted-foreground text-sm hover:underline"
          >
            Back to app
          </Link>
        </div>

        <article className="prose prose-neutral max-w-none">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Last updated: March 17, 2026
          </p>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Overview</h2>
            <p className="mb-4 leading-7">
              The National Tutoring Observatory (NTO) Pipeline is a research
              tool that helps researchers and product teams analyze one-on-one
              tutoring data. This privacy policy explains how we collect, use,
              and protect information when you use our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">
              Information We Collect
            </h2>

            <h3 className="mt-4 mb-2 text-lg font-medium">
              Account Information
            </h3>
            <p className="mb-4 leading-7">
              When you log in via GitHub, we receive your GitHub username,
              display name, and GitHub user ID. This information is used solely
              to authenticate you and manage your access to the application.
            </p>

            <h3 className="mt-4 mb-2 text-lg font-medium">Analytics Data</h3>
            <p className="mb-4 leading-7">
              We use Google Analytics 4 to collect anonymized usage data,
              including:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>Pages visited and navigation patterns</li>
              <li>Application performance metrics</li>
              <li>
                Key feature usage events (e.g., creating prompts, running
                analyses)
              </li>
              <li>Device type, browser, and general geographic region</li>
            </ul>
            <p className="mb-4 leading-7">
              Google Analytics uses cookies to distinguish unique users and
              sessions. IP addresses are anonymized by default in Google
              Analytics 4. We have disabled Google Signals and all advertising
              features, meaning your analytics data is not used for ad targeting
              or shared with Google&apos;s advertising network.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">
              How We Use Your Information
            </h2>
            <p className="mb-4 leading-7">We use collected information to:</p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>Authenticate and manage your account</li>
              <li>
                Understand traffic patterns and how the application is used
              </li>
              <li>Monitor and improve application performance</li>
              <li>Identify and fix technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">What We Do Not Do</h2>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>We do not sell your personal information</li>
              <li>We do not share your data for advertising purposes</li>
              <li>We do not display advertisements</li>
              <li>
                We do not use your data for cross-context behavioral advertising
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Tutoring Data</h2>
            <p className="mb-4 leading-7">
              Tutoring transcripts and session data uploaded to the platform are
              treated as confidential research data. This data is stored
              securely and is only accessible to authorized members of your
              team. It is not included in analytics collection and is not shared
              with any third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">
              Data Storage & Hosting
            </h2>
            <p className="mb-4 leading-7">
              The application and all data are hosted on Amazon Web Services
              (AWS) infrastructure in the United States. AWS acts as a service
              provider processing data on our behalf. Tutoring transcripts,
              session data, and account information are stored in AWS-managed
              databases and storage services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Cookies</h2>
            <p className="mb-4 leading-7">
              We use the following types of cookies:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>
                <strong>Session cookies</strong> — Required to keep you logged
                in and maintain your session.
              </li>
              <li>
                <strong>Analytics cookies</strong> — Used by Google Analytics to
                distinguish users and sessions. These cookies do not identify
                you personally.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">
              Opting Out of Analytics
            </h2>
            <p className="mb-4 leading-7">
              You can opt out of Google Analytics tracking by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              . This add-on prevents Google Analytics JavaScript from sharing
              information with Google Analytics about visit activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Data Retention</h2>
            <p className="mb-4 leading-7">
              Analytics data is retained for 14 months, after which it is
              automatically deleted by Google. Account information is retained
              for as long as your account is active.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">
              Changes to This Policy
            </h2>
            <p className="mb-4 leading-7">
              We may update this privacy policy from time to time. Changes will
              be reflected on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Contact</h2>
            <p className="mb-4 leading-7">
              If you have questions about this privacy policy or our data
              practices, please contact us through the National Tutoring
              Observatory.
            </p>
          </section>

          <section className="text-muted-foreground border-t pt-6 text-sm">
            <p>
              For more information about how Google Analytics handles data, see{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Google&apos;s Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://support.google.com/analytics/answer/6004245"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                How Google uses information from sites that use its services
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
