import type { ReactNode } from "react";

export default function EstimateInfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="border-sandpiper-info/20 bg-sandpiper-info/5 rounded-lg border p-4">
      {children}
    </div>
  );
}
