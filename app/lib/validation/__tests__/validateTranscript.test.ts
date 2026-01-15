import { describe, it, expect } from 'vitest';
import fse from 'fs-extra';
import path from 'path';
import { isValidTranscript, validateAgainstSchema } from '../validateTranscript';
import transcriptSchema from '../../schemas/json/transcript.schema.json';

describe('validateTranscript', () => {
  describe('isValidTranscript', () => {
    it('validates a minimal valid transcript', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Hello!"
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('validates a complete valid transcript with all fields', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Hello!",
            start_time: "00:00:00",
            end_time: "00:00:05",
            session_id: "session_001",
            sequence_id: "1",
            annotations: []
          }
        ],
        leadRole: "Tutor",
        annotations: []
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
    });

    it('validates transcript with utterance annotations (PER_UTTERANCE)', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Great!",
            annotations: [
              {
                _id: "0",
                identifiedBy: "AI",
                given_praise: "Great!"
              }
            ]
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
    });

    it('validates transcript with session annotations (PER_SESSION)', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Hello!"
          }
        ],
        annotations: [
          {
            _id: "0",
            session_quality: "high",
            engagement_level: 4
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
    });

    it('fails when transcript array is missing', () => {
      const transcript = {
        leadRole: "Tutor"
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('transcript');
    });

    it('fails when utterance is missing required _id field', () => {
      const transcript = {
        transcript: [
          {
            role: "Tutor",
            content: "Hello!"
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('_id');
    });

    it('fails when utterance is missing required role field', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            content: "Hello!"
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('role');
    });

    it('fails when utterance is missing required content field', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor"
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('content');
    });

    it('fails when transcript is not an array', () => {
      const transcript = {
        transcript: "not an array"
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
    });

    it('fails when utterance has unexpected additional properties', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Hello!",
            unexpectedField: "value"
          }
        ]
      };

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('unexpectedField');
    });
  });

  describe('validateAgainstSchema', () => {
    it('validates data against any schema', () => {
      const customSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      };

      const validData = { name: 'Test' };
      const invalidData = { age: 25 };

      expect(validateAgainstSchema(validData, customSchema).valid).toBe(true);
      expect(validateAgainstSchema(invalidData, customSchema).valid).toBe(false);
    });

    it('works with transcript schema', () => {
      const transcript = {
        transcript: [
          {
            _id: "0",
            role: "Tutor",
            content: "Hello!"
          }
        ]
      };

      const result = validateAgainstSchema(transcript, transcriptSchema);
      expect(result.valid).toBe(true);
    });
  });

  describe('example files validation', () => {
    it('validates the PER_UTTERANCE example file', async () => {
      const examplePath = path.join(__dirname, '../../../../documentation/schemas/examples/transcript-per-utterance.json');
      const transcript = await fse.readJSON(examplePath);

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
    });

    it('validates the PER_SESSION example file', async () => {
      const examplePath = path.join(__dirname, '../../../../documentation/schemas/examples/transcript-per-session.json');
      const transcript = await fse.readJSON(examplePath);

      const result = isValidTranscript(transcript);
      expect(result.valid).toBe(true);
    });
  });
});
