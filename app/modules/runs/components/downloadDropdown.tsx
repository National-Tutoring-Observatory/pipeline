import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

export default function DownloadDropdown({
  isExporting,
  hasExportedCSV,
  hasExportedJSONL,
  onExportButtonClicked,
}: {
  isExporting: boolean;
  hasExportedCSV: boolean;
  hasExportedJSONL: boolean;
  onExportButtonClicked: ({
    exportType,
  }: {
    exportType: "CSV" | "JSON";
  }) => void;
}) {
  if (hasExportedCSV && hasExportedJSONL) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isExporting}
          className="data-[state=open]:bg-muted flex"
        >
          <Download />
          {isExporting ? <span>Exporting</span> : <span>Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!hasExportedCSV && (
          <DropdownMenuItem
            onClick={() => onExportButtonClicked({ exportType: "CSV" })}
          >
            As Table (.csv file)
          </DropdownMenuItem>
        )}
        {!hasExportedJSONL && (
          <DropdownMenuItem
            onClick={() => onExportButtonClicked({ exportType: "JSON" })}
          >
            JSONL (.jsonl file)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
