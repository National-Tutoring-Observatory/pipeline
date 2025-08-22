import type { Team } from "../teams.types";

interface TeamProps {
  team: Team
}

export default function Team({
  team
}: TeamProps) {

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {team.name}
      </h1>
    </div>
  )
}