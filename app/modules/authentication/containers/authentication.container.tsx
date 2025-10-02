import { LoaderPinwheel } from "lucide-react";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { Outlet, useFetcher, useLocation, useMatch, useMatches } from "react-router";
import get from 'lodash/get';
import LoginContainer from "./login.container";
import type { User } from "~/modules/users/users.types";

export const AuthenticationContext = createContext<{} | null>(null);

export default function AuthenticationContainer({ children }: { children: ReactNode }) {

  const [authentication, setAuthentication] = useState<User | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const authenticationFetcher = useFetcher();
  const isInviteRoute = useMatch("/invite/:id");

  useEffect(() => {
    setHasLoaded(true);
    authenticationFetcher.load(`/api/authentication`);
  }, []);

  useEffect(() => {
    if (hasLoaded && authenticationFetcher.state === 'idle') {
      setIsFetching(false);
      const authentication = get(authenticationFetcher, 'data.authentication.data');
      if (authentication) {
        setAuthentication(authentication);
      }
    }
  }, [authenticationFetcher.state]);

  if (isInviteRoute) {
    return (
      <Outlet />
    );
  }

  if (isFetching) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <LoaderPinwheel className="animate-spin" />
      </div>
    );
  }

  if (!authentication) {
    return (
      <LoginContainer />
    );
  }

  return (
    <AuthenticationContext value={authentication} >
      {children}
    </AuthenticationContext>
  )
}