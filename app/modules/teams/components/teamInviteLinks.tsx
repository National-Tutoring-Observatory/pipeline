import { Button } from "@/components/ui/button";
import { Collection } from "@/components/ui/collection";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Plus } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import getTeamInviteLinksItemActions from "../helpers/getTeamInviteLinksItemActions";
import getTeamInviteLinksItemAttributes from "../helpers/getTeamInviteLinksItemAttributes";
import type { TeamInvite } from "../teamInvites.types";

interface Props {
  invites: TeamInvite[];
  totalPages: number;
  currentPage: number;
  searchValue: string;
  sortValue: string;
  isSyncing: boolean;
  createdByById: Record<string, Pick<User, "name" | "username">>;
  onCreateClicked: () => void;
  onCopyClicked: (invite: TeamInvite) => void;
  onRevokeClicked: (invite: TeamInvite) => void;
  onSearchValueChanged: (value: string) => void;
  onPaginationChanged: (page: number) => void;
  onSortValueChanged: (value: string) => void;
}

export default function TeamInviteLinks({
  invites,
  totalPages,
  currentPage,
  searchValue,
  sortValue,
  isSyncing,
  createdByById,
  onCreateClicked,
  onCopyClicked,
  onRevokeClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: Props) {
  return (
    <div>
      <PageHeader>
        <PageHeaderLeft>
          <h2 className="text-lg font-medium">Invite links</h2>
        </PageHeaderLeft>
        <PageHeaderRight>
          <Button onClick={onCreateClicked}>
            <Plus />
            Create invite link
          </Button>
        </PageHeaderRight>
      </PageHeader>
      <Collection
        items={invites}
        itemsLayout="list"
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        sortValue={sortValue}
        isSyncing={isSyncing}
        hasSearch
        hasPagination
        filters={[]}
        filtersValues={{}}
        sortOptions={[
          { text: "Created", value: "createdAt" },
          { text: "Name", value: "name" },
          { text: "Uses", value: "usedCount" },
        ]}
        emptyAttributes={{
          title: "No invite links yet",
          description:
            "Create a shareable link to invite multiple people to this team.",
        }}
        getItemAttributes={(item) =>
          getTeamInviteLinksItemAttributes(item, createdByById[item.createdBy])
        }
        getItemActions={(item) => getTeamInviteLinksItemActions(item)}
        onActionClicked={() => {}}
        onItemActionClicked={({ id, action }) => {
          const invite = invites.find((i) => i._id === id);
          if (!invite) return;
          if (action === "COPY") onCopyClicked(invite);
          if (action === "REVOKE") onRevokeClicked(invite);
        }}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
