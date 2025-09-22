import { LoaderPinwheel } from "lucide-react";
import { createContext, useEffect, useState, type ReactNode } from "react";

export const AuthenticationContext = createContext<{} | null>(null);

export default function AuthenticationContainer({ children }: { children: ReactNode }) {

  const [authentication, setAuthentication] = useState<{} | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(false);
    setAuthentication({});
  }, []);

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