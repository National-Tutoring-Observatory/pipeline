import { LLMS } from './registerLLM.js';
import find from 'lodash/find.js';


export default (provider) => {
  return find(LLMS, { provider });
}