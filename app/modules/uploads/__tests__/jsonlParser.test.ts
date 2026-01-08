import { describe, expect, it } from 'vitest';
import parseJSONL from '../parsers/jsonlParser';

describe('jsonlParser', () => {
  it('parses valid JSONL with single session', () => {
    const jsonl = `{"session_id":"session_001","role":"Tutor","content":"Hello","sequence_id":1}
{"session_id":"session_001","role":"Student","content":"Hi","sequence_id":2}`;

    const result = parseJSONL(jsonl);

    expect(result).toEqual({
      session_001: [
        { session_id: 'session_001', role: 'Tutor', content: 'Hello', sequence_id: 1 },
        { session_id: 'session_001', role: 'Student', content: 'Hi', sequence_id: 2 },
      ],
    });
  });

  it('parses JSONL with multiple sessions', () => {
    const jsonl = `{"session_id":"session_001","role":"Tutor","content":"Hello","sequence_id":1}
{"session_id":"session_002","role":"Student","content":"Hi","sequence_id":1}`;

    const result = parseJSONL(jsonl);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result.session_001).toHaveLength(1);
    expect(result.session_002).toHaveLength(1);
  });

  it('ignores empty lines', () => {
    const jsonl = `{"session_id":"session_001","role":"Tutor","content":"Hello","sequence_id":1}

{"session_id":"session_001","role":"Student","content":"Hi","sequence_id":2}`;

    const result = parseJSONL(jsonl);

    expect(result.session_001).toHaveLength(2);
  });

  it('throws error if session_id field is missing', () => {
    const jsonl = `{"role":"Tutor","content":"Hello","sequence_id":1}`;

    expect(() => parseJSONL(jsonl)).toThrow('missing required "session_id" field');
  });

  it('throws error if line is not valid JSON', () => {
    const jsonl = `{"session_id":"session_001","role":"Tutor"}
{invalid json}`;

    expect(() => parseJSONL(jsonl)).toThrow('Failed to parse JSONL line');
  });

  it('handles different data types in fields', () => {
    const jsonl = `{"session_id":"session_001","role":"Tutor","sequence_id":1,"timestamp":"2024-01-01T00:00:00Z"}`;

    const result = parseJSONL(jsonl);

    expect(result.session_001[0].sequence_id).toBe(1);
    expect(result.session_001[0].timestamp).toBe('2024-01-01T00:00:00Z');
  });
});
