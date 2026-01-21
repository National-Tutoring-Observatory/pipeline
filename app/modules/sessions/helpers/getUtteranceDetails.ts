import type { Utterance } from "../sessions.types";

export default function getUtteranceDetails({
  utterance,
}: {
  utterance: Utterance;
}) {
  let timestamp = "";
  if (utterance.start_time && utterance.end_time) {
    timestamp = `${utterance.start_time} - ${utterance.end_time}, `;
  } else if (utterance.timestamp) {
    timestamp = `${utterance.timestamp}, `;
  } else if (utterance.start_time) {
    timestamp = `${utterance.start_time}, `;
  }
  return `${timestamp}${utterance.role}`;
}
