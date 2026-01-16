import dayjs from 'dayjs';
import get from 'lodash/get';
import { getAnnotationLabel } from '~/modules/annotations/helpers/annotationTypes';
import { getRunModelDisplayName } from '~/modules/runs/helpers/runModel';
import type { Run } from '~/modules/runs/runs.types';

export default (item: Run) => {
  const promptName = get(item, 'snapshot.prompt.name', '');

  const meta = [{
    text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`
  }, {
    text: `Status - ${item.isComplete ? 'Complete' : 'Incomplete'}`
  }]

  if (item.isComplete) {
    const modelName = getRunModelDisplayName(item);
    meta.push({
      text: `Prompt - ${promptName}`
    })
    meta.push({
      text: `Model - ${modelName}`
    })
  }

  meta.push({
    text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
  });

  return {
    id: item._id,
    title: item.name,
    to: `/projects/${item.project}/runs/${item._id}`,
    meta: meta
  }
}
