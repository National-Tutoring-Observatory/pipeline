import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  GitMerge,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Collection } from "~/modules/collections/collections.types";
import ProjectDownloadDropdown from "~/modules/projects/components/projectDownloadDropdown";

export default function CollectionDetail({
  collection,
  project,
  breadcrumbs,
  onExportCollectionButtonClicked,
  onAddRunsClicked,
  onMergeClicked,
  onDuplicateClicked,
  onEditClicked,
  onDeleteClicked,
}: {
  collection: Collection;
  project: { _id: string; name: string };
  breadcrumbs: Breadcrumb[];
  onExportCollectionButtonClicked: ({
    exportType,
  }: {
    exportType: string;
  }) => void;
  onAddRunsClicked: () => void;
  onMergeClicked: () => void;
  onDuplicateClicked: () => void;
  onEditClicked: () => void;
  onDeleteClicked: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const parts = location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const active = last === "evaluations" ? "evaluations" : "overview";

  const handleTabChange = (value: string) => {
    const basePath = `/projects/${project._id}/collections/${collection._id}`;
    if (value === "overview") {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${value}`);
    }
  };

  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          <div className="text-muted-foreground flex gap-1">
            <ProjectDownloadDropdown
              isExporting={collection.isExporting || false}
              hasExportedCSV={collection.hasExportedCSV || false}
              hasExportedJSONL={collection.hasExportedJSONL || false}
              onExportButtonClicked={onExportCollectionButtonClicked}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="data-[state=open]:bg-muted">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddRunsClicked}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Runs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMergeClicked}>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicateClicked}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditClicked}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteClicked}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageHeaderRight>
      </PageHeader>
      <Tabs value={active} onValueChange={handleTabChange} className="mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet context={{ collection, project }} />
    </div>
  );
}
