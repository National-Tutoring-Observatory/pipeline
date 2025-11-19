import each from 'lodash/each';
import has from 'lodash/has';
import LLM from '~/modules/llm/llm';
import leadRolePrompt from '../prompts/leadRole.prompt.json';

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

  llm.addSystemMessage(leadRolePrompt.system, {});

  llm.addUserMessage(leadRolePrompt.user, {
    roles: uniqueRoles.join(' | ')
  });

  const response = await llm.createChat();

  attributeMapping.leadRole = response.leadRole;

  return attributeMapping;

}
