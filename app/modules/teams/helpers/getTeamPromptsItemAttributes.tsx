import dayjs from 'dayjs';
import { getAnnotationLabel } from '~/modules/annotations/helpers/annotationTypes';
import usePromptAuthorization from "~/modules/prompts/hooks/usePromptAuthorization";
import type { Prompt } from '~/modules/prompts/prompts.types';

export default (item: Prompt, teamId: string) => {
  const { canCreate } = usePromptAuthorization(teamId);

  return {
    id: item._id,
    title: item.name,
    to: canCreate ? `/prompts/${item._id}/${item.productionVersion}` : undefined,
    meta: [{
      text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`
    }, {
      text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
    }]
  }
}
