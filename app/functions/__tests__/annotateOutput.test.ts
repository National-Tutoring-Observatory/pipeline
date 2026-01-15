import { describe, it, expect } from 'vitest';
import { isValidTranscript } from '../../lib/validation/validateTranscript';

describe('annotation output validation', () => {
  it('validates PER_UTTERANCE annotation output', () => {
    // Simulate annotated transcript output
    const annotatedTranscript = {
      transcript: [
        {
          _id: '0',
          role: 'Tutor',
          content: 'Hello!',
          session_id: 'session_001',
          sequence_id: '1',
          annotations: []
        },
        {
          _id: '1',
          role: 'Student',
          content: 'Hi!',
          session_id: 'session_001',
          sequence_id: '2',
          annotations: []
        },
        {
          _id: '2',
          role: 'Tutor',
          content: 'Great!',
          session_id: 'session_001',
          sequence_id: '3',
          annotations: [
            {
              _id: '2',
              identifiedBy: 'AI',
              given_praise: 'Great!'
            }
          ]
        }
      ],
      leadRole: 'Tutor',
      annotations: []
    };

    // Validate against schema
    const validation = isValidTranscript(annotatedTranscript);

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
    expect(annotatedTranscript.transcript[2].annotations).toHaveLength(1);
    expect(annotatedTranscript.transcript[2].annotations[0].given_praise).toBe('Great!');
  });

  it('validates PER_SESSION annotation output', () => {
    // Simulate session-level annotated transcript
    const annotatedTranscript = {
      transcript: [
        {
          _id: '0',
          role: 'Tutor',
          content: 'Hello!',
          annotations: []
        },
        {
          _id: '1',
          role: 'Student',
          content: 'Hi!',
          annotations: []
        }
      ],
      leadRole: 'Tutor',
      annotations: [
        {
          _id: '0',
          session_quality: 'high',
          engagement_level: 4,
          identifiedBy: 'AI'
        }
      ]
    };

    // Validate against schema
    const validation = isValidTranscript(annotatedTranscript);

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
    expect(annotatedTranscript.annotations).toHaveLength(1);
    expect(annotatedTranscript.annotations[0].session_quality).toBe('high');
  });

  it('detects when annotation structure is invalid', () => {
    // Invalid: annotations is not an array
    const invalidTranscript = {
      transcript: [
        {
          _id: '0',
          role: 'Tutor',
          content: 'Hello!',
          annotations: 'not an array' // Invalid!
        }
      ]
    };

    const validation = isValidTranscript(invalidTranscript);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toBeDefined();
  });
});
