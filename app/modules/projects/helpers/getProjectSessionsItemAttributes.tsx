import dayjs from 'dayjs';
import type { Session } from '~/modules/sessions/sessions.types';

export default (item: Session) => {
  const status = item.hasConverted === true 
    ? "Converted" 
    : item.hasErrored 
      ? "Errored" 
      : "Not converted";

  return {
    id: item._id,
    title: item.name,
    to: item.hasConverted ? undefined : undefined,
    isDisabled: !item.hasConverted,
    meta: [{
      text: `File type - ${item.fileType}`
    }, {
      text: `Status - ${status}`
    }, {
      text: `Created at - ${dayjs(item.createdAt).format('ddd, MMM D, YYYY - h:mm A')}`,
    }]
  }
}
