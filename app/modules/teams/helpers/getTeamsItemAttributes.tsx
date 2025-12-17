import dayjs from 'dayjs';
import type { Team } from '../teams.types';

export default (item: Team) => {
  return {
    id: item._id,
    title: item.name,
    to: `/teams/${item._id}`,
    meta: [{
      text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
    }]
  }
}
