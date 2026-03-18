import { cn } from "@/lib/utils";
import { useNavigation } from "react-router";

function NavigationProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {isNavigating ? "Loading page..." : "Page loaded"}
      </div>
      <div
        className={cn(
          "bg-primary/20 fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden transition-opacity duration-200",
          isNavigating ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
      >
        <div className="animate-shimmer bg-sandpiper-progress h-full w-1/3" />
      </div>
    </>
  );
}

export { NavigationProgress };
