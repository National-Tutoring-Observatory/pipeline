import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fse from 'fs-extra';
import map from 'lodash/map';
import { isValidTranscript } from '../../../app/lib/validation/validateTranscript';

describe('convertFileToSession output validation', () => {
  const outputFolder = 'test-conversion-output';

  beforeEach(async () => {
    await fse.ensureDir(`tmp/${outputFolder}`);
  });

  afterEach(async () => {
    await fse.remove(`tmp/${outputFolder}`);
  });

  it('simulates conversion and validates output format', async () => {
    // Simulate what convertFileToSession does
    const inputData = [
      {
        role: 'Tutor',
        content: 'Hello!',
        start_time: '00:00:00',
        end_time: '00:00:05',
        session_id: 'session_001',
        sequence_id: '1'
      },
      {
        role: 'Student',
        content: 'Hi!',
        start_time: '00:00:05',
        end_time: '00:00:08',
        session_id: 'session_001',
        sequence_id: '2'
      }
    ];

    // This mimics the conversion logic
    const transcript = map(inputData, (dataItem, index) => {
      return {
        _id: `${index}`,
        role: dataItem.role,
        content: dataItem.content,
        start_time: dataItem.start_time,
        end_time: dataItem.end_time,
        session_id: dataItem.session_id,
        sequence_id: dataItem.sequence_id,
        annotations: [],
      }
    });

    const json = {
      transcript,
      leadRole: 'Tutor',
      annotations: [],
    };

    // Validate against schema
    const validation = isValidTranscript(json);

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
    }

    expect(validation.valid).toBe(true);
    expect(json.transcript).toHaveLength(2);
    expect(json.transcript[0]._id).toBe('0');
    expect(json.transcript[0].role).toBe('Tutor');
    expect(json.transcript[0].content).toBe('Hello!');
    expect(json.transcript[0].annotations).toEqual([]);
  });

  it('detects invalid output when required fields are missing', () => {
    // Simulate bad conversion output
    const transcript = map([{ content: 'Hello!' }], (dataItem, index) => {
      return {
        _id: `${index}`,
        // Missing role!
        content: dataItem.content,
        annotations: [],
      }
    });

    const json = {
      transcript,
      annotations: [],
    };

    // Validate - should fail
    const validation = isValidTranscript(json);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toBeDefined();
    expect(validation.errors![0].message).toContain('role');
  });
});
