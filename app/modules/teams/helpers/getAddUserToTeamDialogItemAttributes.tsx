import type { User } from "~/modules/users/users.types";

export default (user: User) => {
  return {
    id: user._id,
    title: user.username,
  };
};
