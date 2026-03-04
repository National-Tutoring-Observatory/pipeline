import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Download } from "lucide-react";

export default function DownloadDropdown({
  isExporting,
  onExportButtonClicked,
}: {
  isExporting: boolean;
  onExportButtonClicked: ({
    exportType,
  }: {
    exportType: "CSV" | "JSON";
  }) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isExporting}
          className="data-[state=open]:bg-muted flex"
        >
          {isExporting ? <Spinner /> : <Download />}
          {isExporting ? <span>Exporting</span> : <span>Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onExportButtonClicked({ exportType: "CSV" })}
        >
          As Table (.csv file)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExportButtonClicked({ exportType: "JSON" })}
        >
          JSONL (.jsonl file)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
