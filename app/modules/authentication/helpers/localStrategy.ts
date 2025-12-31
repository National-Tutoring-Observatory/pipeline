import { Strategy } from "remix-auth/strategy";
import { UserService } from "~/modules/users/user";

export namespace LOCAL {
  export interface ConstructorOptions {
  }

  export interface VerifyOptions { }
}

class LOCAL<User> extends Strategy<User, LOCAL.VerifyOptions> {
  name = "local";

  constructor(
    protected options: LOCAL.ConstructorOptions,
    verify: Strategy.VerifyFunction<User, LOCAL.VerifyOptions>
  ) {
    super(verify);
  }

  async authenticate(request: Request): Promise<User> {
    return await this.verify({});
  }
}

const localStrategy = new LOCAL(
  {},
  async () => {
    if (!process.env.DOCUMENTS_ADAPTER || process.env.DOCUMENTS_ADAPTER === 'LOCAL') {
      const users = await UserService.find();
      if (users.length === 0) {
        throw new Error("User not found");
      }
      return users[0] as any;
    }
    throw new Error("Unsupported DOCUMENTS_ADAPTER");
  }
)

export default localStrategy;
