import { LLMS } from "./registerLLM";
import find from "lodash/find";

export default (provider: string) => {
  return find(LLMS, { provider });
};
