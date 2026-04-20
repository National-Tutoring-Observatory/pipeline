import crypto from "crypto";
import slugify from "slugify";

export default function generateTeamInviteSlug(name: string): string {
  const base =
    slugify(name, { lower: true, strict: true, trim: true }) || "invite";
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}
