import type { Session } from "~/modules/sessions/sessions.types";

export default function ProjectRunSessions({ sessionObject, session }: { sessionObject: { name: string }, session: Session }) {
  console.log(session);
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 relative">
        <div className="flex justify-between">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {sessionObject.name}
          </h1>
        </div>
      </div>
    </div>
  )
}