import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

function NavigationProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      setIsVisible(true);
    } else if (isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isNavigating, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {isNavigating ? "Loading page..." : "Page loaded"}
      </div>
      <div
        className="bg-primary/20 fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full w-1/3 bg-orange-400",
            isNavigating ? "animate-shimmer" : "w-full",
          )}
        />
      </div>
    </>
  );
}

export { NavigationProgress };
