import { Button } from "@/components/ui/button";
import { Outlet } from "react-router";

export default function FeatureFlags({
  onCreateFeatureFlagButtonClicked
}: {
  onCreateFeatureFlagButtonClicked: () => void
}) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Feature flags
      </h1>
      <div>
        <div>
          <div className="flex justify-end border-b p-2">
            <Button onClick={onCreateFeatureFlagButtonClicked}>Create feature flag</Button>
          </div>
        </div>
        <div>

        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}