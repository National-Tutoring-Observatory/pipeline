import { useState } from "react";
import RevokeSuperAdminForm from "../components/revokeSuperAdminForm";
import type { User } from "../users.types";

interface RevokeSuperAdminDialogContainerProps {
  targetUser: User;
  isSubmitting: boolean;
  onRevokeSuperAdminClicked: (reason: string) => void;
}

export default function RevokeSuperAdminDialogContainer({
  targetUser,
  isSubmitting,
  onRevokeSuperAdminClicked,
}: RevokeSuperAdminDialogContainerProps) {
  const [reason, setReason] = useState<string>("");

  const isFormValid = reason.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;
    onRevokeSuperAdminClicked(reason);
  };

  return (
    <RevokeSuperAdminForm
      targetUser={targetUser}
      reason={reason}
      isSubmitting={isSubmitting}
      isSubmitButtonDisabled={!isFormValid || isSubmitting}
      onReasonChanged={(e) => setReason(e.target.value)}
      onRevokeSuperAdminClicked={handleSubmit}
    />
  );
}
