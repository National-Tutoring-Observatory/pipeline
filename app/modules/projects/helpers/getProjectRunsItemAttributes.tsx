import dayjs from 'dayjs';
import find from 'lodash/find';
import get from 'lodash/get';
import { getAnnotationLabel } from '~/modules/annotations/helpers/annotationTypes';
import providers from '~/modules/prompts/providers';
import type { Run } from '~/modules/runs/runs.types';

export default (item: Run) => {
  const promptName = get(item, 'prompt.name', '');
  const providerName = find(providers, { provider: item.model })?.name || item.model;

  return {
    id: item._id,
    title: item.name,
    to: `/projects/${item.project}/runs/${item._id}`,
    meta: [{
      text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`
    }, {
      text: `Prompt - ${promptName}`
    }, {
      text: `Model - ${providerName}`
    }, {
      text: `Status - ${item.isComplete ? 'Complete' : 'Incomplete'}`
    }, {
      text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
    }]
  }
}
