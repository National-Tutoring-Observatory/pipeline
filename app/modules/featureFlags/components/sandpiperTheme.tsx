import { useEffect } from "react";
import useHasFeatureFlag from "../hooks/useHasFeatureFlag";

// TODO: Remove this component once HAS_SANDPIPER_THEME is fully rolled out.
// When removing:
// 1. Delete this file
// 2. Remove <SandpiperTheme /> from authentication.container.tsx
// 3. In app.css: move .sandpiper-theme overrides into :root, delete the
//    old defaults, and remove the .sandpiper-theme selector
export default function SandpiperTheme() {
  const hasTheme = useHasFeatureFlag("HAS_SANDPIPER_THEME");

  useEffect(() => {
    document.documentElement.classList.toggle("sandpiper-theme", hasTheme);
    return () => document.documentElement.classList.remove("sandpiper-theme");
  }, [hasTheme]);

  return null;
}
