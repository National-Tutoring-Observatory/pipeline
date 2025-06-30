import Prompts from "../components/prompts";
import type { Route } from "./+types/prompts.route";

export default function PromptsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Prompts />
  )
}