import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function CodesViewer({ codes }: { codes: string[] }) {
  return (
    <div>
      <Label className="mb-0.5 text-xs">Codes</Label>
      {codes.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {codes.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1">
              {code}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
