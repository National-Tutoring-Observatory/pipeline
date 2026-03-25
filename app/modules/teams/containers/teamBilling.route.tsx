import { useEffect } from "react";
import {
  redirect,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import BillingAuthorization from "~/modules/billing/authorization";
import { TeamBillingService } from "~/modules/billing/billing";
import { BillingPlanService } from "~/modules/billing/billingPlan";
import AddCreditsDialog from "~/modules/billing/components/addCreditsDialog";
import AssignBillingPlanDialog from "~/modules/billing/components/assignBillingPlanDialog";
import SetBillingUserDialogContainer from "~/modules/billing/containers/setBillingUserDialog.container";
import addCredits from "~/modules/billing/services/addCredits.server";
import { TeamBillingPlanService } from "~/modules/billing/teamBillingPlan";
import { TeamCreditService } from "~/modules/billing/teamCredit";
import addDialog from "~/modules/dialogs/addDialog";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";
import { UserService } from "~/modules/users/user";
import TeamAuthorization from "../authorization";
import TeamBilling from "../components/teamBilling";
import { TeamService } from "../team";
import type { Route } from "./+types/teamBilling.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/");

  if (!TeamAuthorization.canView(user, params.id)) {
    return redirect("/");
  }

  const hasBilling = await hasFeatureFlag(
    "HAS_BILLING",
    { request },
    { defaultValue: false },
  );
  if (!hasBilling) {
    return redirect(`/teams/${params.id}/users`);
  }

  const team = await TeamService.findById(params.id);
  if (!team) return redirect("/teams");

  const creditsQueryParams = getQueryParamsFromRequest(
    request,
    {
      searchValue: "",
      currentPage: 1,
      sort: "-createdAt",
      filters: {},
    },
    { paramPrefix: "credits" },
  );

  const creditsQuery = buildQueryFromParams({
    match: { team: params.id },
    queryParams: creditsQueryParams,
    searchableFields: ["note"],
    sortableFields: ["createdAt", "amount"],
  });

  const isSuperAdmin = BillingAuthorization.canAssignPlan(user);

  const [balanceSummary, credits, billingUserInfo, billingPlans] =
    await Promise.all([
      TeamBillingService.getBalanceSummary(params.id),
      TeamCreditService.paginate(creditsQuery),
      team.billingUser
        ? UserService.findById(team.billingUser).then((u) =>
            u ? { _id: u._id, username: u.username } : null,
          )
        : Promise.resolve(null),
      isSuperAdmin ? BillingPlanService.find() : Promise.resolve([]),
    ]);

  return {
    team,
    balanceSummary,
    credits,
    billingUserInfo,
    billingPlans,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getSessionUser({ request });
  if (!user) throw new Error("Authentication required");

  const { intent, payload = {} } = await request.json();

  const team = await TeamService.findById(params.id);
  if (!team) throw new Error("Team not found");

  switch (intent) {
    case "ADD_CREDITS": {
      if (!BillingAuthorization.canAddCredits(user, team)) {
        return {
          success: false,
          error: "You do not have permission to add credits",
        };
      }
      const result = await addCredits({
        teamId: params.id,
        amount: payload.amount,
        note: payload.note,
        addedBy: user._id,
      });
      return result;
    }

    case "SET_BILLING_USER": {
      if (!BillingAuthorization.canSetBillingUser(user)) {
        return {
          success: false,
          error: "Only super admins can set the billing user",
        };
      }
      const targetUser = await UserService.findById(payload.userId);
      if (
        !targetUser ||
        !targetUser.teams.some((t: any) => t.team === params.id)
      ) {
        return { success: false, error: "User is not a member of this team" };
      }
      await TeamService.updateById(params.id, {
        billingUser: payload.userId,
      });
      return { success: true };
    }

    case "ASSIGN_PLAN": {
      if (!BillingAuthorization.canAssignPlan(user)) {
        return {
          success: false,
          error: "Only super admins can assign billing plans",
        };
      }
      if (!payload.planId) {
        return { success: false, error: "Plan ID is required" };
      }
      const plan = await BillingPlanService.findById(payload.planId);
      if (!plan) {
        return { success: false, error: "Billing plan not found" };
      }
      await TeamBillingPlanService.assignPlan(params.id, plan._id);
      return { success: true };
    }

    default:
      return { success: false, error: "Invalid intent" };
  }
}

export default function TeamBillingRoute() {
  const { team, balanceSummary, credits, billingUserInfo, billingPlans } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();

  const {
    searchValue: creditsSearchValue,
    setSearchValue: setCreditsSearchValue,
    currentPage: creditsCurrentPage,
    setCurrentPage: setCreditsCurrentPage,
    isSyncing: isCreditsSyncing,
  } = useSearchQueryParams(
    {
      searchValue: "",
      currentPage: 1,
      sortValue: "-createdAt",
      filters: {},
    },
    { paramPrefix: "credits" },
  );

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      toast.success("Billing updated");
      revalidate();
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, revalidate]);

  const submitAddCredits = (amount: number, note: string) => {
    fetcher.submit(
      JSON.stringify({ intent: "ADD_CREDITS", payload: { amount, note } }),
      { method: "POST", encType: "application/json" },
    );
  };

  const openAddCreditsDialog = () => {
    addDialog(<AddCreditsDialog onAddCreditsClicked={submitAddCredits} />);
  };

  const submitAssignPlan = (planId: string) => {
    fetcher.submit(
      JSON.stringify({ intent: "ASSIGN_PLAN", payload: { planId } }),
      { method: "POST", encType: "application/json" },
    );
  };

  const openAssignPlanDialog = () => {
    addDialog(
      <AssignBillingPlanDialog
        plans={billingPlans}
        currentPlanId={balanceSummary?.plan._id}
        onAssignPlanClicked={submitAssignPlan}
      />,
    );
  };

  const submitSetBillingUser = (userId: string) => {
    fetcher.submit(
      JSON.stringify({ intent: "SET_BILLING_USER", payload: { userId } }),
      { method: "POST", encType: "application/json" },
    );
  };

  const openSetBillingUserDialog = () => {
    addDialog(
      <SetBillingUserDialogContainer
        teamId={team._id}
        currentBillingUserId={team.billingUser}
        onSetBillingUserClicked={submitSetBillingUser}
      />,
    );
  };

  return (
    <TeamBilling
      balanceSummary={balanceSummary}
      team={team}
      credits={credits}
      billingUserInfo={billingUserInfo}
      isSubmitting={fetcher.state !== "idle"}
      creditsSearchValue={creditsSearchValue}
      creditsCurrentPage={creditsCurrentPage}
      isCreditsSyncing={isCreditsSyncing}
      onCreditsSearchValueChanged={setCreditsSearchValue}
      onCreditsPaginationChanged={setCreditsCurrentPage}
      onAddCreditsClicked={openAddCreditsDialog}
      onAssignPlanClicked={openAssignPlanDialog}
      onSetBillingUserClicked={openSetBillingUserDialog}
    />
  );
}
