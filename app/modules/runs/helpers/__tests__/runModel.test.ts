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
    it('should return model info when snapshot exists', () => {
      const run = createRun({
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'google.gemini-2.5-flash', name: 'Gemini Flash', provider: 'Google' }
        }
      });

      const info = getRunModelInfo(run);

      expect(info).toBeDefined();
      expect(info?.code).toBe('google.gemini-2.5-flash');
      expect(info?.provider).toBe('Google');
    });

    it('should return undefined when no snapshot', () => {
      const run = createRun();
      const info = getRunModelInfo(run);
      expect(info).toBeUndefined();
    });
  });

  describe('getRunModelCode', () => {
    it('should prefer snapshot.model.code over model field', () => {
      const run = createRun({
        model: 'old-value',
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'new-code', name: 'New', provider: 'Provider' }
        }
      });

      expect(getRunModelCode(run)).toBe('new-code');
    });

    it('should fallback to model field when snapshot unavailable', () => {
      const run = createRun({ model: 'some-code' });
      expect(getRunModelCode(run)).toBe('some-code');
    });
  });

  describe('getRunModelDisplayName', () => {
    it('should use snapshot name when available', () => {
      const run = createRun({
        model: 'old-value',
        snapshot: {
          prompt: { name: 'p', userPrompt: 'up', annotationSchema: [], annotationType: 'PER_UTTERANCE', version: 1 },
          model: { code: 'code', name: 'Display Name', provider: 'Provider' }
        }
      });

      expect(getRunModelDisplayName(run)).toBe('Display Name');
    });

    it('should fallback to raw model value when no snapshot', () => {
      const run = createRun({ model: 'raw-value' });
      expect(getRunModelDisplayName(run)).toBe('raw-value');
    });
  });
});
