import { useEffect } from "react";
import { data, redirect, useFetcher, useNavigate } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { UserService } from "~/modules/users/user";
import Onboarding from "../components/onboarding";
import type { Route } from "./+types/onboarding.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/signup");
  if (user.onboardingComplete) return redirect("/");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/signup");

  const { intent, payload = {} } = await request.json();

  if (intent !== "COMPLETE_ONBOARDING") {
    return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }

  const { institution, userRole, useCases, scholarshipInterest } = payload;

  if (!institution || !String(institution).trim()) {
    return data(
      { errors: { institution: "Institution is required" } },
      { status: 400 },
    );
  }

  if (!userRole) {
    return data(
      { errors: { userRole: "Please select your role" } },
      { status: 400 },
    );
  }

  if (!Array.isArray(useCases) || useCases.length === 0) {
    return data(
      { errors: { useCases: "Please select at least one use case" } },
      { status: 400 },
    );
  }

  await UserService.updateById(user._id, {
    institution: String(institution).trim(),
    userRole,
    useCases,
    scholarshipInterest: Boolean(scholarshipInterest),
    onboardingComplete: true,
  });

  return data({ success: true, data: { redirectTo: "/" } });
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function OnboardingRoute() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("success" in fetcher.data)) return;
    navigate((fetcher.data as any).data.redirectTo);
  }, [fetcher.state, fetcher.data, navigate]);

  const handleSubmit = (formData: {
    institution: string;
    userRole: string;
    useCases: string[];
    scholarshipInterest: boolean;
  }) => {
    fetcher.submit(
      JSON.stringify({ intent: "COMPLETE_ONBOARDING", payload: formData }),
      { method: "POST", encType: "application/json" },
    );
  };

  const errors =
    fetcher.data && "errors" in fetcher.data
      ? (fetcher.data.errors as Record<string, string>)
      : undefined;

  return (
    <Onboarding
      errors={errors}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
