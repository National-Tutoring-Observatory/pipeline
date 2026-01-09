import { useState } from 'react';
import type { User } from '../users.types';
import AssignSuperAdminForm from '../components/assignSuperAdminForm';

interface AssignSuperAdminDialogContainerProps {
  targetUser: User;
  isSubmitting: boolean;
  onAssignSuperAdminClicked: (reason: string) => void;
}

export default function AssignSuperAdminDialogContainer({
  targetUser,
  isSubmitting,
  onAssignSuperAdminClicked
}: AssignSuperAdminDialogContainerProps) {
  const [reason, setReason] = useState<string>('');

  const isFormValid = reason.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;
    onAssignSuperAdminClicked(reason);
  };

  return (
    <AssignSuperAdminForm
      targetUser={targetUser}
      reason={reason}
      isSubmitting={isSubmitting}
      isSubmitButtonDisabled={!isFormValid || isSubmitting}
      onReasonChanged={(e) => setReason(e.target.value)}
      onAssignSuperAdminClicked={() => handleSubmit()}
    />
  );
}
