/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useFileAccumulator, { getFileKey } from '../hooks/useFileAccumulator';

function createMockFile(name: string, size: number, lastModified: number): File {
  const file = new File([''], name, { type: 'text/csv' });
  Object.defineProperty(file, 'size', { value: size });
  Object.defineProperty(file, 'lastModified', { value: lastModified });
  return file;
}

describe('getFileKey', () => {
  it('generates key from name, size, and lastModified', () => {
    const file = createMockFile('test.csv', 1024, 1234567890);
    expect(getFileKey(file)).toBe('test.csv-1024-1234567890');
  });
});

describe('useFileAccumulator', () => {
  it('starts with empty files', () => {
    const { result } = renderHook(() => useFileAccumulator());
    expect(result.current.acceptedFiles).toEqual([]);
  });

  it('adds files on drop', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file = createMockFile('test.csv', 1024, 1234567890);

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.acceptedFiles).toHaveLength(1);
    expect(result.current.acceptedFiles[0].name).toBe('test.csv');
  });

  it('accumulates files across multiple drops', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file1 = createMockFile('file1.csv', 100, 1000);
    const file2 = createMockFile('file2.csv', 200, 2000);

    act(() => {
      result.current.addFiles([file1]);
    });
    act(() => {
      result.current.addFiles([file2]);
    });

    expect(result.current.acceptedFiles).toHaveLength(2);
  });

  it('rejects duplicate files', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file = createMockFile('test.csv', 1024, 1234567890);

    act(() => {
      result.current.addFiles([file]);
    });
    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.acceptedFiles).toHaveLength(1);
  });

  it('allows files with same name but different size', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file1 = createMockFile('test.csv', 100, 1000);
    const file2 = createMockFile('test.csv', 200, 1000);

    act(() => {
      result.current.addFiles([file1, file2]);
    });

    expect(result.current.acceptedFiles).toHaveLength(2);
  });

  it('allows files with same name but different lastModified', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file1 = createMockFile('test.csv', 100, 1000);
    const file2 = createMockFile('test.csv', 100, 2000);

    act(() => {
      result.current.addFiles([file1, file2]);
    });

    expect(result.current.acceptedFiles).toHaveLength(2);
  });

  it('removes file by id', () => {
    const { result } = renderHook(() => useFileAccumulator());
    const file = createMockFile('test.csv', 1024, 1234567890);

    act(() => {
      result.current.addFiles([file]);
    });

    const fileId = result.current.acceptedFiles[0]._id;

    act(() => {
      result.current.removeFile(fileId);
    });

    expect(result.current.acceptedFiles).toHaveLength(0);
  });
});
