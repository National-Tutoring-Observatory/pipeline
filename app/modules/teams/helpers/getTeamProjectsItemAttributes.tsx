import dayjs from 'dayjs';
import useProjectAuthorization from "~/modules/projects/hooks/useProjectAuthorization";
import type { Project } from '~/modules/projects/projects.types';

export default (item: Project, teamId: string) => {
  const { canCreate } = useProjectAuthorization(teamId);

  return {
    id: item._id,
    title: item.name,
    to: canCreate ? `/projects/${item._id}` : undefined,
    meta: [{
      text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
    }]
  }
}
