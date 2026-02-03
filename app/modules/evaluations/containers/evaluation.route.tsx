import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { redirect, useLoaderData } from "react-router";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import Evaluation from "~/modules/evaluations/components/evaluation";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/evaluation.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  const evaluation = await EvaluationService.findById(params.evaluationId);
  if (!evaluation) {
    return redirect(
      `/projects/${params.projectId}/collections/${params.collectionId}/evaluations`,
    );
  }

  return { project, collection, evaluation };
}

export default function EvaluationRoute() {
  const { project, collection, evaluation } = useLoaderData<typeof loader>();

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
    {
      text: collection.name,
      link: `/projects/${project._id}/collections/${collection._id}`,
    },
    {
      text: "Evaluations",
      link: `/projects/${project._id}/collections/${collection._id}/evaluations`,
    },
    { text: evaluation.name },
  ];

  return (
    <div className="px-8 pt-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>

      <Evaluation evaluation={evaluation} />
    </div>
  );
}
