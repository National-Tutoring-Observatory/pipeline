import { useMemo, useState } from "react";
import AddSuperAdminToTeamDialog from "../components/addSuperAdminToTeamDialog";

export default function AddSuperAdminToTeamDialogContainer({
  onAddSuperAdminClicked,
}: {
  onAddSuperAdminClicked: () => void,
}) {

  const [reason, setReason] = useState('');

  const isSubmitButtonDisabled = useMemo(() => {
    return !(reason && reason.trim().length > 0);
  }, [reason]);

  const onReasonChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('reason changed', event.target.value);
    setReason(event.target.value);
  };

  return (
    <AddSuperAdminToTeamDialog
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      reason={reason}
      onReasonChanged={onReasonChanged}
      onAddSuperAdminToTeamClicked={onAddSuperAdminClicked}
    />
  );
}
