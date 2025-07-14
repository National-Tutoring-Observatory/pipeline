import clsx from "clsx";
import { NotebookPen } from "lucide-react";
import type { Utterance } from "../sessions.types";

export default function SessionViewerUtterance({ utterance }: { utterance: Utterance }) {
  return (
    <div key={utterance._id} className={clsx('flex mb-4', {
      'justify-start': utterance.role === 'TEACHER',
      'justify-end': utterance.role !== 'TEACHER',
    })}>
      <div className="flex flex-col max-w-3/4">
        <div className='bg-muted p-4 rounded-lg'>
          {utterance.content}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <div>
            {utterance.start_time} - {utterance.role}
          </div>
          {(utterance.annotations.length > 0) && (
            <div className="ml-4 flex items-center text-purple-500">
              <NotebookPen size={12} className="mr-1" />
              {utterance.annotations.length} annotations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}