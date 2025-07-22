import './providers/openAI'
import './providers/aiGateway'
import getLLM from './helpers/getLLM';
import each from 'lodash/each.js';
import type { LLMSettings, LLMOptions } from './llm.types';
import { DEFAULT_LLM_SETTINGS } from './llm.types';


const DEFAULTS = { quality: 'medium', model: 'GEMINI', stream: false, format: 'json', retries: 3 };

interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

interface OrchestratorMessage {
  role: 'assistant';
  content: string;
}

type Variables = Record<string, any>;



class LLM {
  options: Record<string, any>;
  messages: Message[];
  orchestratorMessage: any;
  methods: any;
  retries: number;
  llm: any;
  llmSettings: LLMSettings;

  constructor(options: LLMOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.messages = [];
    this.orchestratorMessage;
    this.llmSettings = options.llmSettings || DEFAULT_LLM_SETTINGS;
    const llm = getLLM(process.env.LLM_PROVIDER || '');
    this.retries = 0;
    if (llm && llm.methods) {
      this.methods = llm.methods;
      this.llm = llm.methods.init();
    } else {
      console.warn(`This LLM does not exist`);
    }
  }

  createChat = async (): Promise<any> => {
    if (this.orchestratorMessage) {

      const response = await this.methods.createChat({
        ...this,
        llmSettings: this.llmSettings
      });

      const scoreResponse = await this.methods.createChat({
        llm: this.llm,
        options: { ...this.options, quality: 'high' },
        llmSettings: this.llmSettings,
        messages: [this.orchestratorMessage, {
          "role": 'assistant',
          'content': `
          # Where score is 0 when the output is not acceptable
          # Where score is 1 when the output is acceptable and conforms.
          # Where reasoning is your reasoning as to why you scored it the way you did and a potential fix if we were to run it again.
          # You must return the following JSON: {\"score\": 0, \"reasoning\": \"\"}
          Output: ${JSON.stringify(response)}
          `
        }]
      });

      if (scoreResponse.score > 0.8) {
        return response;
      } else {
        console.warn(`Score: ${scoreResponse.score}, Reasoning: ${scoreResponse.reasoning}`);
        if (this.retries < this.options.retries) {
          this.retries++;
          console.warn(`Retrying ${this.retries} out of ${this.options.retries}`);
          this.addUserMessage(`This is not correct. Please try again with the following reason why this is not correct. Reasoning: ${scoreResponse.reasoning}`, {});
          return await this.createChat();
        } else {
          throw { message: 'Too many retries' };
        }
      }

    } else {
      return this.methods.createChat({
        ...this,
        llmSettings: this.llmSettings
      });
    }

  };

  replaceMessageWithVariables = (message: string, variables: Record<string, any> = {}): string => {
    each(variables, (variableValue, variableKey) => {
      message = message.replaceAll(`{{${variableKey}}}`, variableValue)
    });
    return message;
  }

  setOrchestratorMessage = (message: string, variables: Variables): void => {

    message = this.replaceMessageWithVariables(message, variables);

    this.orchestratorMessage = {
      'role': 'assistant',
      'content': message.trim()
    } as OrchestratorMessage;
  }

  addSystemMessage = (message: string, variables: Variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.messages.push({
      'role': 'system',
      'content': message.trim()
    });
  };

  addAssistantMessage = (message: string, variables: Variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.messages.push({
      'role': 'assistant',
      'content': message.trim()
    });
  };

  addUserMessage = (message: string, variables: Variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.messages.push({
      'role': 'user',
      'content': message.trim()
    });
  };

  getLastMessage = () => {
    return this.messages[this.messages.length - 1];
  };

  getMessages = () => {
    return this.messages;
  };

  getMessagesAsString = () => {
    let string = '';
    for (const message of this.messages) {
      string += message.content + '\n';
    }
    return string;
  }

}

export default LLM;