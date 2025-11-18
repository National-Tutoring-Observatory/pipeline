import each from 'lodash/each';
import has from 'lodash/has';
import LLM from '~/modules/llm/llm';

const REQUIRED_ATTRIBUTES = {
  'session_id': {
    'alternatives': ['sessionId', 'sessionID'],
  },
  'role': {
    'alternatives': ['speaker']
  },
  'content': {
    'alternatives': ['text']
  },
  'sequence_id': {
    'alternatives': []
  }
}

export default async function getAttributeMappingFromFile({ file, team }: { file: File, team: string }): Promise<Record<string, string>> {
  const fileContents = await file.text();

  const fileContentsAsJSON = JSON.parse(fileContents);

  const firstUtterance = fileContentsAsJSON[0];

  let attributeMapping: Record<string, string> = {};

  if (firstUtterance) {
    each(REQUIRED_ATTRIBUTES, (requiredAttribute, requiredAttributeKey) => {
      if (has(firstUtterance, requiredAttributeKey)) {
        attributeMapping[requiredAttributeKey] = requiredAttributeKey
      } else {
        each(requiredAttribute.alternatives, (alternative) => {
          if (attributeMapping[requiredAttributeKey]) return;
          if (has(firstUtterance, alternative)) {
            attributeMapping[requiredAttributeKey] = alternative;
          }
        })
      }
    })
  }

  const uniqueRoles = [...new Set(fileContentsAsJSON.map((utterance: { role: string }) => utterance.role))];

  const llm = new LLM({ quality: 'high', model: 'GEMINI', user: team });

  llm.addSystemMessage("You are an expert in finding who is a lead role in a conversation. These conversations are usual between a teacher and student. The conversations can also be between a chatbot and a user.", {});

  llm.addUserMessage(`Out of these unique roles, who would you define as being the lead role (teacher or chatbot)? {{roles}}.
    - Only return a value from the list of roles.
    - Return the result as leadRole: [one of the role values]
  `, {
    roles: uniqueRoles.join(' | ')
  });

  const response = await llm.createChat();

  attributeMapping.leadRole = response.leadRole;

  return attributeMapping;

}
