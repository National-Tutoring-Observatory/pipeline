import { MODELS_BY_COLLECTION } from './getModelFromCollection';
import invert from 'lodash/invert';

export default (model: string) => {
  if (model) {
    return invert(MODELS_BY_COLLECTION)[model];
  }
}