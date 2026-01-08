import { describe, expect, it } from 'vitest';
import splitMultipleSessionsIntoFiles from '../services/splitMultipleSessionsIntoFiles';

describe('splitMultipleSessionsIntoFiles', () => {
  it('throws error if no files provided', async () => {
    await expect(splitMultipleSessionsIntoFiles({ files: [] })).rejects.toThrow('No files provided');
  });

  it('detects CSV file type and creates split files', async () => {
    const csvContent = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1
session_002,Tutor,Welcome,1`;

    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const result = await splitMultipleSessionsIntoFiles({ files: [csvFile] });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('session_001.json');
    expect(result[1].name).toBe('session_002.json');
  });

  it('detects JSONL file type and creates split files', async () => {
    const jsonlContent = `{"session_id":"session_001","role":"Tutor","content":"Hello","sequence_id":1}
{"session_id":"session_002","role":"Tutor","content":"Welcome","sequence_id":1}`;

    const jsonlFile = new File([jsonlContent], 'test.jsonl', { type: 'application/jsonl' });
    const result = await splitMultipleSessionsIntoFiles({ files: [jsonlFile] });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('session_001.json');
    expect(result[1].name).toBe('session_002.json');
  });

  it('handles mixed CSV and JSONL files with auto-detection', async () => {
    const csvContent = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1`;

    const jsonlContent = `{"session_id":"session_002","role":"Tutor","content":"Hi","sequence_id":1}`;

    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const jsonlFile = new File([jsonlContent], 'test.jsonl', { type: 'application/jsonl' });

    const result = await splitMultipleSessionsIntoFiles({ files: [csvFile, jsonlFile] });

    expect(result).toHaveLength(2);
    expect(result.map((f) => f.name)).toEqual(['session_001.json', 'session_002.json']);
  });

  it('detects session_id collisions across files', async () => {
    const csvContent = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1`;

    const jsonlContent = `{"session_id":"session_001","role":"Tutor","content":"Hi","sequence_id":1}`;

    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const jsonlFile = new File([jsonlContent], 'test.jsonl', { type: 'application/jsonl' });

    await expect(
      splitMultipleSessionsIntoFiles({ files: [csvFile, jsonlFile] })
    ).rejects.toThrow('Session ID collision detected: "session_001"');
  });

  it('rejects unsupported file extensions', async () => {
    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    await expect(splitMultipleSessionsIntoFiles({ files: [txtFile] })).rejects.toThrow(
      'Unsupported file type: "test.txt"'
    );
  });

  it('creates valid JSON split files from parsed data', async () => {
    const csvContent = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1
session_001,Student,Hi,2`;

    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const result = await splitMultipleSessionsIntoFiles({ files: [csvFile] });

    const splitFileContent = await result[0].text();
    const parsed = JSON.parse(splitFileContent);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].session_id).toBe('session_001');
  });
});
