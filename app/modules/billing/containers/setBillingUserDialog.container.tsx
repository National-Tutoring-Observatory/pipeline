import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { User } from "~/modules/users/users.types";
import SetBillingUserDialog from "../components/setBillingUserDialog";

export default function SetBillingUserDialogContainer({
  teamId,
  currentBillingUserId,
  onSetBillingUserClicked,
}: {
  teamId: string;
  currentBillingUserId?: string;
  onSetBillingUserClicked: (userId: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetcher = useFetcher();

  useEffect(() => {
    const params = new URLSearchParams({
      teamId,
      searchValue,
      currentPage: currentPage.toString(),
    });
    fetcher.load(`/api/teamMembers?${params.toString()}`);
  }, [teamId, searchValue, currentPage]);

  const onSearchValueChanged = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const members = (fetcher.data?.data || []) as User[];
  const totalPages = fetcher.data?.totalPages || 1;

  return (
    <SetBillingUserDialog
      members={members}
      currentBillingUserId={currentBillingUserId}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={totalPages}
      onSetBillingUserClicked={onSetBillingUserClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={setCurrentPage}
    />
  );
}
