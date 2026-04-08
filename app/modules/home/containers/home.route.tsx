import { useEffect } from "react";
import { useFetcher } from "react-router";
import Home from "../components/home";

export function loader() {
  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  const fetcher = useFetcher();
  const isDownloading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("downloadUrl" in fetcher.data)) return;
    const url = (fetcher.data as { downloadUrl: string }).downloadUrl;
    window.open(url, "_blank");
  }, [fetcher.state, fetcher.data]);

  const onDownloadClicked = () => {
    fetcher.submit(
      JSON.stringify({ intent: "REQUEST_MTM_DOWNLOAD", agreed: true }),
      {
        method: "POST",
        action: "/api/downloadMtmDataset",
        encType: "application/json",
      },
    );
  };

  return (
    <Home onDownloadClicked={onDownloadClicked} isDownloading={isDownloading} />
  );
}
