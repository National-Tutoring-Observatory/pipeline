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

  const loadMembers = (search: string, page: number) => {
    const params = new URLSearchParams({
      teamId,
      searchValue: search,
      currentPage: page.toString(),
    });
    fetcher.load(`/api/teamMembers?${params.toString()}`);
  };

  useEffect(() => {
    loadMembers("", 1);
  }, [teamId]);

  const onSearchValueChanged = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    loadMembers(value, 1);
  };

  const onPaginationChanged = (page: number) => {
    setCurrentPage(page);
    loadMembers(searchValue, page);
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
      isSyncing={fetcher.state !== "idle"}
      onSetBillingUserClicked={onSetBillingUserClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
    />
  );
}
