import get from "lodash/get";
import { LoaderPinwheel } from "lucide-react";
import { createContext, useEffect, useRef, type ReactNode } from "react";
import { Outlet, useFetcher, useLocation, useMatch } from "react-router";
import { connectSockets } from "~/modules/sockets/sockets";
import type { User } from "~/modules/users/users.types";
import LoginContainer from "./login.container";

export const AuthenticationContext = createContext<User | null>(null);

export default function AuthenticationContainer({
  children,
}: {
  children: ReactNode;
}) {
  const authenticationFetcher = useFetcher();
  const isInviteRoute = useMatch("/invite/:id");
  const lastFetchRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 1 * 60 * 1000;
  const prevAuthRef = useRef<User | null>(null);
  const location = useLocation();

  const isFetching = !authenticationFetcher.data;
  const authentication: User | null = get(
    authenticationFetcher,
    "data.authentication.data",
    null,
  );

  useEffect(() => {
    authenticationFetcher.load(`/api/authentication`);
  }, []);

  useEffect(() => {
    if (!authenticationFetcher.data || authenticationFetcher.state !== "idle")
      return;

    if (authentication) {
      prevAuthRef.current = authentication;
      connectSockets();
    } else if (prevAuthRef.current) {
      window.location.reload();
    }
  }, [authenticationFetcher.state]);

  // reload authentication on client-side navigation so server-side loader
  // updates `lastActivity` and keeps the session alive while browsing.
  // Rate-limit requests to avoid excessive backend calls
  useEffect(() => {
    if (!authenticationFetcher.data) return;
    const now = Date.now();
    if (now - (lastFetchRef.current || 0) > MIN_FETCH_INTERVAL) {
      lastFetchRef.current = now;
      authenticationFetcher.load(`/api/authentication`);
    }
  }, [location.pathname]);

  if (isInviteRoute) {
    return <Outlet />;
  }

  if (isFetching) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderPinwheel className="animate-spin" />
      </div>
    );
  }

  if (!authentication) {
    return <LoginContainer />;
  }

  return (
    <AuthenticationContext value={authentication}>
      {children}
    </AuthenticationContext>
  );
}
