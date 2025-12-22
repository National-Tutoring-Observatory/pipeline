import dayjs from 'dayjs';
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import PromptAuthorization from '~/modules/prompts/authorization';
import type { Prompt } from '~/modules/prompts/prompts.types';
import type { User } from '~/modules/users/users.types';

export default (item: Prompt, teamId: string, user: User | null) => {
  const canCreate = PromptAuthorization.canCreate(user, teamId);

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
