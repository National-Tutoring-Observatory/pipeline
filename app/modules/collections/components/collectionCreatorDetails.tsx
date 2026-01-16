import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CollectionCreatorDetails = ({
  name,
  onNameChanged
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Collection Name</Label>
      <Input
        id="name"
        placeholder="e.g., Question Asking Experiment"
        value={name}
        onChange={(e) => onNameChanged(e.target.value)}
      />
    </div>
  );
};

export default CollectionCreatorDetails;
