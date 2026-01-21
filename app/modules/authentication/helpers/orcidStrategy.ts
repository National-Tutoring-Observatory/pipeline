import { redirect } from "react-router";
import { Strategy } from "remix-auth/strategy";
import { UserService } from "~/modules/users/user";

/**
 * The user profile returned by ORCID.
 * This is a partial representation, focusing on common fields.
 * For a full list of fields, see the ORCID API documentation.
 * @see https://info.orcid.org/documentation/api-tutorials/api-tutorial-read-data-on-a-record/
 */
export interface OrcidProfile {
  id: string;
  name: {
    "given-names": { value: string };
    "family-name": { value: string };
  } | null;
  emails: {
    email: {
      email: string;
      primary: boolean;
      verified: boolean;
    }[];
  };
}

/**
 * The parameters returned by the ORCID token endpoint.
 */
export interface OrcidExtraParams extends Record<string, unknown> {
  token_type: "bearer";
  name: string;
  orcid: string;
}

export namespace OrcidStrategy {
  /**
   * Options for configuring the ORCID authentication strategy.
   */
  export interface Options {
    /**
     * The ORCID client ID.
     */
    clientID: string;
    /**
     * The ORCID client secret.
     */
    clientSecret: string;
    /**
     * The URL to redirect to after authentication.
     */
    callbackURL: string;
    /**
     * The scopes to request from ORCID, separated by spaces.
     * Defaults to "/authenticate".
     * @see https://info.orcid.org/documentation/api-reference/scopes/
     */
    scope?: string;
    /**
     * Determines whether to use the ORCID sandbox environment.
     * Defaults to `false`.
     */
    sandbox?: boolean;
  }

  /**
   * The options passed to the verify function.
   */
  export interface VerifyOptions {
    accessToken: string;
    refreshToken: string;
    extraParams: OrcidExtraParams;
    profile: OrcidProfile;
  }
}

export class OrcidStrategy<User> extends Strategy<
  User,
  OrcidStrategy.VerifyOptions
> {
  name = "orcid";
  protected options: OrcidStrategy.Options;
  protected authorizationURL: string;
  protected tokenURL: string;
  protected profileURL: string;

  constructor(
    options: OrcidStrategy.Options,
    verify: Strategy.VerifyFunction<User, OrcidStrategy.VerifyOptions>,
  ) {
    super(verify);
    this.options = options;

    const baseURL = options.sandbox
      ? "https://sandbox.orcid.org"
      : "https://orcid.org";
    const apiBaseURL = options.sandbox
      ? "https://api.sandbox.orcid.org/v3.0"
      : "https://api.orcid.org/v3.0";

    this.authorizationURL = `${baseURL}/oauth/authorize`;
    this.tokenURL = `${baseURL}/oauth/token`;
    // The profile URL is constructed dynamically later using the orcid ID
    this.profileURL = apiBaseURL;
  }

  async authenticate(request: Request): Promise<User> {
    const url = new URL(request.url);
    const callbackURL = new URL(this.options.callbackURL);

    // 1. Handle the initial redirect to the authorization server
    if (url.pathname !== callbackURL.pathname) {
      const params = new URLSearchParams({
        client_id: this.options.clientID,
        response_type: "code",
        scope: this.options.scope || "/authenticate",
        redirect_uri: this.options.callbackURL,
      });

      throw new Response(null, {
        status: 302,
        headers: {
          Location: `${this.authorizationURL}?${params.toString()}`,
        },
      });
    }

    // 2. Handle the callback from the authorization server
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      throw new Error(
        url.searchParams.get("error_description") ||
          `Error from ORCID: ${error}`,
      );
    }
    if (!code) {
      throw new Error("Missing authorization code from ORCID.");
    }

    // 3. Exchange the authorization code for an access token
    const tokenResponse = await this.exchangeCodeForToken(code);

    // This is not being used due to permissions
    // 4. Fetch the user profile from the ORCID API
    // const profile = await this.fetchUserProfile(
    //   tokenResponse.accessToken,
    //   tokenResponse.extraParams.orcid
    // );

    // 5. Verify the user and return them
    // @ts-ignore
    const user = await this.verify({
      ...tokenResponse,
      profile: { id: tokenResponse.extraParams.orcid, emails: [] },
    });
    return user;
  }

  private async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    extraParams: OrcidExtraParams;
  }> {
    const params = new URLSearchParams({
      client_id: this.options.clientID,
      client_secret: this.options.clientSecret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: this.options.callbackURL,
    });

    try {
      const response = await fetch(this.tokenURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(
          `Failed to exchange code for token. Status: ${response.status}. Body: ${bodyText}`,
        );
      }

      const data = (await response.json()) as any;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        extraParams: {
          token_type: data.token_type,
          name: data.name,
          orcid: data.orcid,
        },
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        `Network error while exchanging code for token: ${(error as Error).message}`,
      );
    }
  }

  private async fetchUserProfile(
    accessToken: string,
    orcid: string,
  ): Promise<OrcidProfile> {
    const profileEndpoint = `${this.profileURL}/${orcid}/person`;
    try {
      const response = await fetch(profileEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(
          `Failed to fetch user profile. Status: ${response.status}. Body: ${bodyText}`,
        );
      }

      const data = (await response.json()) as any;

      // Map the ORCID response to a more standardized profile format
      return {
        id: data.path,
        name: data.name,
        emails: data.emails,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        `Network error while fetching user profile: ${(error as Error).message}`,
      );
    }
  }
}

const orcidStrategy = new OrcidStrategy<any>(
  {
    clientID: process.env.ORCID_CLIENT_ID!,
    clientSecret: process.env.ORCID_CLIENT_SECRET!,
    callbackURL: `${process.env.AUTH_CALLBACK_URL}/orcid`,
    sandbox: process.env.NODE_ENV === "development",
  },
  async ({ profile }) => {
    const users = await UserService.find({
      match: { orcidId: profile.id, hasOrcidSSO: true },
    });
    if (users.length === 0) {
      throw redirect("/?error=UNREGISTERED");
    }

    return users[0] as any;
  },
);

export default orcidStrategy;
