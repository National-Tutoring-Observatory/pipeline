import { Outlet } from "react-router";
import type { Prompt, PromptVersion } from "../prompts.types";
import map from 'lodash/map';

export default function Prompt({
  prompt,
  promptVersions,
}: { prompt: Prompt, promptVersions: PromptVersion[] }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {prompt.name}
      </h1>
      <div className="border rounded-md flex">

        <div className="w-1/4 h-full border-r">
          Prompt versions
          {map(promptVersions, (promptVersion) => {
            return (
              <div key={promptVersion._id}>
                Prompt version
              </div>
            );
          })}
        </div>
        <div className="w-3/4 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}