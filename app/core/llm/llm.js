import './providers/openAI.js'
import './providers/aiGateway.js'
import getLLM from './helpers/getLLM.js';
import each from 'lodash/each.js';

const DEFAULTS = { quality: 'medium', stream: false, format: 'json', retries: 3 };

class LLM {
  constructor(options = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.messages = [];
    this.orchestratorMessage;
    const { methods } = getLLM(process.env.LLM_PROVIDER);
    this.methods = methods;
    this.retries = 0;
    this.llm = methods.init();
  }

  createChat = async () => {
    if (this.orchestratorMessage) {

      const response = await this.methods.createChat(this);

      const scoreResponse = await this.methods.createChat({
        llm: this.llm,
        options: { ...this.options, quality: 'high' },
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
          this.addUserMessage(`This is not correct. Please try again with the following reason why this is not correct. Reasoning: ${scoreResponse.reasoning}`);
          return await this.createChat();
        } else {
          throw { message: 'Too many retries' };
        }
      }

    } else {
      return this.methods.createChat(this);
    }

  };

  replaceMessageWithVariables = (message, variables = {}) => {
    each(variables, (variableValue, variableKey) => {
      message = message.replaceAll(`{{${variableKey}}}`, variableValue)
    });
    return message;
  }

  setOrchestratorMessage = (message, variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.orchestratorMessage = {
      'role': 'assistant',
      'content': message.trim()
    };
  }

  addSystemMessage = (message, variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.messages.push({
      'role': 'system',
      'content': message.trim()
    });
  };

  addAssistantMessage = (message, variables) => {

    message = this.replaceMessageWithVariables(message, variables);

    this.messages.push({
      'role': 'assistant',
      'content': message.trim()
    });
  };

  addUserMessage = (message, variables) => {

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