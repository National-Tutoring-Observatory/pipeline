import { LoaderPinwheel } from "lucide-react";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { useFetcher } from "react-router";
import get from 'lodash/get';

export const AuthenticationContext = createContext<{} | null>(null);

export default function AuthenticationContainer({ children }: { children: ReactNode }) {

  const [authentication, setAuthentication] = useState<{} | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const authenticationFetcher = useFetcher();

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

  if (isFetching) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <LoaderPinwheel className="animate-spin" />
      </div>
    );
  }

  if (!authentication) {
    return (
      <div>Login screen</div>
    );
  }

  return (
    <AuthenticationContext value={authentication} >
      {children}
    </AuthenticationContext>
  )
}