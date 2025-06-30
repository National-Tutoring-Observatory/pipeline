export const LLMS = [];

export default (provider, methods) => {
  LLMS.push({ provider, methods });
}