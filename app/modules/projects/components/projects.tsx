import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ProjectsProps {
  projects: [],
  onCreateNewProjectClicked: () => void;
}

export function Projects({
  projects,
  onCreateNewProjectClicked
}: ProjectsProps) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Projects
      </h1>
      {(projects.length > 0) && (
        <div>
          <Button variant="outline" onClick={onCreateNewProjectClicked}>Create new project</Button>
        </div>
      )}
      <div>
        {(projects.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No projects created
            <div className="mt-3">
              <Button onClick={onCreateNewProjectClicked}>Create a project</Button>
            </div>
          </div>
        )}
        {(projects.length > 0) && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(projects.length === 0) && (
                <div>
                  No projects created
                </div>
              )}

              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
