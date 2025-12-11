import map from 'lodash/map';
import pick from 'lodash/pick';
import type { SessionFile, Utterance } from "~/modules/sessions/sessions.types";

export default (sessionJson: SessionFile) => {
  return JSON.stringify({
    "transcript": map(sessionJson.transcript, (utterance: Utterance) => {
      return pick(utterance, ['_id', 'role', 'content', 'start_time', 'end_time', 'timestamp']);
    }),
    "leadRole": sessionJson.leadRole,
  })
}
