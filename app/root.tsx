import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";

import { NavigationProgress } from "@/components/ui/navigation-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import * as ga from "~/modules/analytics/analytics";
import type { Route } from "./+types/root";
import "./app.css";
import AppSidebar from "./modules/app/components/appSidebar";
import AuthenticationContainer from "./modules/authentication/containers/authentication.container";
import DialogContainer from "./modules/dialogs/containers/dialog.container";
import useHasFeatureFlag from "./modules/featureFlags/hooks/useHasFeatureFlag";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/assets/nto-favicon.png", type: "image/png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:wght@300;400&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [{ title: "Sandpiper - NTO" }];

export function loader() {
  return { googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavigationProgress />
        <AuthenticationContainer>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </AuthenticationContainer>
        <Toaster />
        <DialogContainer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function useGoogleAnalytics(gaId: string | null) {
  const location = useLocation();

  useEffect(() => {
    if (gaId) ga.initialize(gaId);
  }, [gaId]);

  useEffect(() => {
    ga.trackPageView(location.pathname);
  }, [location]);
}

export default function App() {
  const { googleAnalyticsId } = useLoaderData<typeof loader>();
  useGoogleAnalytics(googleAnalyticsId);
  const hasSandpiperTheme = useHasFeatureFlag("HAS_SANDPIPER_THEME");
  return (
    <>
      {hasSandpiperTheme && (
        <link
          rel="icon"
          href="/assets/sandpiper-favicon.svg"
          type="image/svg+xml"
        />
      )}
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
