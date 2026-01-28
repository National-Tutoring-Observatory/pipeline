import dayjs from "dayjs";

export default (date: string | Date | undefined | null, fallback = "--") => {
  if (date) {
    return dayjs(date).format("ddd, MMM D, YYYY - h:mm A");
  }
  return fallback;
};
