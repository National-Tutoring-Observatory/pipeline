import find from "lodash/find";
import { LLMS } from "./registerLLM";

export default (provider: string) => {
  return find(LLMS, { provider });
};
