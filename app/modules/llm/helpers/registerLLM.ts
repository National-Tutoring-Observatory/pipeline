// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LLMMethods = Record<string, (...args: any[]) => any>;

export interface LLMProvider {
  provider: string;
  methods: LLMMethods;
}

export const LLMS: LLMProvider[] = [];

export default (provider: string, methods: LLMMethods) => {
  LLMS.push({ provider, methods });
};
