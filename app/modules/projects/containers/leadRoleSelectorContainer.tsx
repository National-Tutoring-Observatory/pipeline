import { useState } from 'react';
import LeadRoleSelector from '../components/leadRoleSelector';

export default function LeadRoleSelectorContainer({
  roles,
  selectedLeadRole,
  onSelectedLeadRoleChanged
}: {
  roles: string[],
  selectedLeadRole: string | null,
  onSelectedLeadRoleChanged: (selectedLeadRole: string) => void,
}) {

  const [isOpen, setIsOpen] = useState(false);

  const onTogglePopover = (isOpen: boolean) => {
    setIsOpen(isOpen);
  }

  return (
    <LeadRoleSelector
      roles={roles}
      selectedLeadRole={selectedLeadRole}
      isOpen={isOpen}
      onTogglePopover={onTogglePopover}
      onSelectedLeadRoleChanged={onSelectedLeadRoleChanged}
    />
  )
}
