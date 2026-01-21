import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import map from "lodash/map";
import { LoaderPinwheel } from "lucide-react";
import type { Session, Utterance } from "../sessions.types";
import SessionViewerUtterance from "./sessionViewerUtterance";

export default function ViewSession({
  session,
  transcript,
  leadRole,
}: {
  session: Session;
  transcript: any;
  leadRole: string;
}) {
  return (
    <DialogContent className="max-h-screen">
      <DialogHeader>
        <DialogTitle>{`Session ${session.name}`}</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div>
        {!transcript && (
          <div className="flex justify-center">
            <LoaderPinwheel className="animate-spin" />
          </div>
        )}
        <div className="flex h-full max-h-[calc(100vh-200px)] flex-col overflow-y-scroll scroll-smooth p-4">
          {map(transcript, (utterance: Utterance) => {
            return (
              <SessionViewerUtterance
                key={utterance._id}
                utterance={utterance}
                leadRole={leadRole}
                isSelected={false}
                onUtteranceClicked={() => {}}
              />
            );
          })}
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
