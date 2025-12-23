import { describe, it, expect } from 'vitest';
import { getRunModelCode, getRunModelDisplayName, getRunModelInfo } from '../runModel';
import type { Run } from '~/modules/runs/runs.types';

const createRun = (overrides: Partial<Run> = {}): Run => ({
  _id: 'run1',
  model: 'fallback-model',
  ...overrides,
} as Run);

describe('Run Model Helpers', () => {
  describe('getRunModelInfo', () => {
    it('should return model info from snapshot', () => {
      const run = createRun({
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'google.gemini-2.5-flash', name: 'Gemini Flash', provider: 'Google' }
        }
      });

      const info = getRunModelInfo(run);

      expect(info.code).toBe('google.gemini-2.5-flash');
      expect(info.name).toBe('Gemini Flash');
      expect(info.provider).toBe('Google');
    });
  });

  describe('getRunModelCode', () => {
    it('should return snapshot model code', () => {
      const run = createRun({
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'google.gemini-2.5-flash', name: 'Gemini', provider: 'Google' }
        }
      });

      expect(getRunModelCode(run)).toBe('google.gemini-2.5-flash');
    });
  });

  describe('getRunModelDisplayName', () => {
    it('should return snapshot model display name', () => {
      const run = createRun({
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'google.gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' }
        }
      });

      expect(getRunModelDisplayName(run)).toBe('Gemini 2.5 Flash');
    });
  });
});
