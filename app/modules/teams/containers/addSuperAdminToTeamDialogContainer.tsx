import { useMemo, useState } from "react";
import AddSuperAdminToTeamDialog from "../components/addSuperAdminToTeamDialog";
import type { TeamAssignmentOption } from "../teams.types";

export default function AddSuperAdminToTeamDialogContainer({
  onAddSuperAdminClicked,
}: {
  onAddSuperAdminClicked: (
    reason: string,
    option: TeamAssignmentOption,
  ) => void;
}) {
  const [reason, setReason] = useState("");
  const [option, setOption] = useState<TeamAssignmentOption>("temporary");

  const isSubmitButtonDisabled = useMemo(() => {
    return !(reason && reason.trim().length > 0);
  }, [reason]);

  const onReasonChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(event.target.value);
  };

  const onOptionChanged = (value: TeamAssignmentOption) => {
    setOption(value);
  };

  return (
    <AddSuperAdminToTeamDialog
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      reason={reason}
      option={option}
      onReasonChanged={onReasonChanged}
      onOptionChanged={onOptionChanged}
      onAddSuperAdminClicked={() => onAddSuperAdminClicked(reason, option)}
    />
  );
}
