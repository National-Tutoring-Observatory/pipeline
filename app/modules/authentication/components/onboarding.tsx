import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const USER_ROLES = [
  "Researcher",
  "Grad Student",
  "Instructor/Faculty",
  "Other",
] as const;

const USE_CASE_OPTIONS = [
  "Analyzing student-tutor interactions",
  "Training or evaluating AI tutors",
  "Educational research",
  "Curriculum development",
  "Other",
] as const;

interface OnboardingProps {
  errors?: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (data: {
    institution: string;
    userRole: string;
    useCases: string[];
    scholarshipInterest: boolean;
  }) => void;
}

export default function Onboarding({
  errors,
  isSubmitting,
  onSubmit,
}: OnboardingProps) {
  const [institution, setInstitution] = useState("");
  const [userRole, setUserRole] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [scholarshipInterest, setScholarshipInterest] = useState(false);

  const toggleUseCase = (value: string) => {
    setUseCases((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ institution, userRole, useCases, scholarshipInterest });
  };

  return (
    <div
      className="flex min-h-screen w-screen items-center justify-center"
      style={{ backgroundColor: "#f7f7f7" }}
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img
            src="/assets/nto-logo-icon.png"
            alt="NTO Logo"
            className="w-12"
          />
        </div>
        <h1 className="mb-1 text-center text-2xl font-semibold">
          Tell us about yourself
        </h1>
        <p className="text-muted-foreground mb-8 text-center text-sm">
          Help us understand how you plan to use the platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              placeholder="e.g. Stanford University"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
            {errors?.institution && (
              <p className="text-destructive text-sm">{errors.institution}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRole">Your role</Label>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger id="userRole">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.userRole && (
              <p className="text-destructive text-sm">{errors.userRole}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>How do you plan to use the platform?</Label>
            {USE_CASE_OPTIONS.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={option}
                  checked={useCases.includes(option)}
                  onCheckedChange={() => toggleUseCase(option)}
                />
                <Label htmlFor={option} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
            {errors?.useCases && (
              <p className="text-destructive text-sm">{errors.useCases}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="scholarshipInterest"
              checked={scholarshipInterest}
              onCheckedChange={(checked) =>
                setScholarshipInterest(checked === true)
              }
            />
            <Label
              htmlFor="scholarshipInterest"
              className="cursor-pointer font-normal"
            >
              I'm interested in scholarship or grant opportunities related to
              tutoring research
            </Label>
          </div>

          {errors?.general && (
            <p className="text-destructive text-sm">{errors.general}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
