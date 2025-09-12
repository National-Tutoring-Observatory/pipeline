export interface LLMProvider {
  provider: string;
  methods: any;
}

export const LLMS: LLMProvider[] = [];

export default (provider: string, methods: any) => {
  LLMS.push({ provider, methods });
}