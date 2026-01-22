import dayjs from "dayjs";
import find from "lodash/find";
import { redirect } from "react-router";
import { GitHubStrategy } from "remix-auth-github";
import INVITE_LINK_TTL_DAYS from "~/modules/teams/helpers/inviteLink";
import { UserService } from "~/modules/users/user";
import type { UserTeam } from "~/modules/users/users.types";
import sessionStorage from "../../../../sessionStorage.js";

const githubStrategy = new GitHubStrategy<any>(
  {
    //@ts-ignore
    clientId: process.env.GITHUB_CLIENT_ID,
    //@ts-ignore
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //@ts-ignore
    redirectURI: `${process.env.AUTH_CALLBACK_URL}/github`,
    scopes: ["user:email"],
  },
  async ({ tokens, request }) => {
    let userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokens.accessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    let emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokens.accessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    let githubUser = await userResponse.json();

    let emails = await emailsResponse.json();

    let session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );

    const inviteId = session.get("inviteId");

    const isInvitedUser = !!inviteId;

    const users = await UserService.find({
      match: { githubId: githubUser.id, hasGithubSSO: true },
    });
    let user = users.length > 0 ? users[0] : null;

    let update: any = {};

    if (!user) {
      // if no user but is invite, update the invitedUser
      if (isInvitedUser) {
        const invitedUsers = await UserService.find({ match: { inviteId } });
        user = invitedUsers.length > 0 ? invitedUsers[0] : null;

        if (user) {
          if (
            dayjs().isAfter(
              dayjs(user.invitedAt).add(INVITE_LINK_TTL_DAYS, "day"),
            )
          ) {
            throw redirect("/?error=EXPIRED_INVITE");
          }
          update.inviteId = null;
          update.isRegistered = true;
          update.registeredAt = new Date();
          update.githubId = githubUser.id;
          update.hasGithubSSO = true;
        } else {
          throw redirect("/?error=UNREGISTERED");
        }
      } else {
        throw redirect("/?error=UNREGISTERED");
      }
    } else if (isInvitedUser) {
      // If user already exists, check teams and add if that team does not exist on the user.
      const invitedUsers = await UserService.find({ match: { inviteId } });
      const invitedUser = invitedUsers.length > 0 ? invitedUsers[0] : null;

      if (!invitedUser) throw redirect("/?error=UNREGISTERED");

      if (
        dayjs().isAfter(
          dayjs(invitedUser.invitedAt).add(INVITE_LINK_TTL_DAYS, "day"),
        )
      ) {
        throw redirect("/?error=EXPIRED_INVITE");
      }

      const invitedUserTeam = invitedUser.teams[0] as UserTeam;
      const currentUserTeams = user.teams;
      const isPartOfInvitedTeam = find(currentUserTeams, {
        team: invitedUserTeam.team,
      });
      if (!isPartOfInvitedTeam) {
        currentUserTeams.push(invitedUserTeam);
        update.teams = currentUserTeams;
      }
      // Remove old invited user.
      await UserService.deleteById(invitedUser._id);
    }

    let email = find(emails, (email) => {
      if (email.primary) {
        return email;
      }
    });

    if (!email) {
      if (emails.length > 0) {
        email = emails[0];
      } else {
        email = {};
      }
    }

    update.username = githubUser.name || githubUser.login;
    update.email = email.email;

    user = await UserService.updateById(user._id, update);

    return user;
  },
);

export default githubStrategy;
