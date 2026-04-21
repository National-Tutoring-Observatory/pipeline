import { useRouteLoaderData } from "react-router";

export function AnnouncementBanner() {
  const rootData = useRouteLoaderData("root") as
    | { initialCredits: number }
    | undefined;
  const initialCredits = rootData?.initialCredits ?? 20;

  return (
    <div className="fixed top-0 right-0 left-0 z-[60] bg-[#367181] py-2 text-center">
      <span className="text-[0.82rem] font-semibold tracking-[0.02em] text-white">
        🎁 New users get <strong>${initialCredits} in free credits</strong> to
        start annotating
      </span>
    </div>
  );
}
