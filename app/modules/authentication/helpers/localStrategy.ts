import { Strategy } from "remix-auth/strategy";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
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
      const documents = getDocumentsAdapter();
      const user = await documents.getDocument<User>({ collection: 'users', match: {} });
      if (!user.data) {
        throw new Error("User not found");
      }
      return user.data;
    }
    throw new Error("Unsupported DOCUMENTS_ADAPTER");
  }
)

export default localStrategy;
