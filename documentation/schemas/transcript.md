# Transcript Format Specification

This document describes the JSON format for tutoring session transcripts used in the NTO Pipeline.

## Overview

Transcripts represent conversations between tutors and students. They consist of:
- **Utterances**: Individual turns in the conversation
- **Annotations**: Labels or codes applied to utterances or sessions

## JSON Schema

See [`app/lib/schemas/json/transcript.schema.json`](../../app/lib/schemas/json/transcript.schema.json) for the formal JSON Schema definition used for validation in the codebase.

## Format Structure

```json
{
  "transcript": [
    {
      "_id": "string (required)",
      "role": "string (required)",
      "content": "string (required)",
      "start_time": "string (optional)",
      "end_time": "string (optional)",
      "session_id": "string (optional)",
      "sequence_id": "string (optional)",
      "annotations": []
    }
  ],
  "leadRole": "string (optional)",
  "annotations": []
}
```

## Field Descriptions

### Root Level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transcript` | Array | **Yes** | Array of utterance objects representing the conversation |
| `leadRole` | String | No | Primary instructor role (e.g., "Tutor", "Teacher") |
| `annotations` | Array | No | Session-level annotations (used with PER_SESSION annotation type) |

### Utterance Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | String | **Yes** | Unique identifier for this utterance within the session. Used to match annotations across multiple runs. |
| `role` | String | **Yes** | Speaker role (e.g., "Tutor", "Student", "Teacher", "STUDENT_1") |
| `content` | String | **Yes** | The actual text spoken in this turn |
| `start_time` | String | No | Timestamp when utterance begins (format flexible) |
| `end_time` | String | No | Timestamp when utterance ends (format flexible) |
| `session_id` | String | No | Session identifier (may be added during processing) |
| `sequence_id` | String | No | Sequential position in conversation |
| `annotations` | Array | No | Utterance-level annotations (used with PER_UTTERANCE annotation type) |

### Annotation Object (Utterance-level)

Used when `annotationType` is `PER_UTTERANCE`:

```json
{
  "_id": "string",
  "customField1": "value",
  "customField2": "value"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | String | **Yes** | Reference to the utterance `_id` this annotation belongs to |
| *custom fields* | Any | No | Annotation schema fields defined by the prompt |

The annotation schema is defined in the prompt configuration. Common examples include:
- `given_praise`: Boolean or string indicating if praise was given
- `identifiedBy`: String identifying who/what created the annotation
- `code`: String code or category
- `explanation`: String explanation of the annotation

### Annotation Object (Session-level)

Used when `annotationType` is `PER_SESSION`:

```json
{
  "_id": "string",
  "customField1": "value",
  "customField2": "value"
}
```

Session-level annotations appear in the root `annotations` array and apply to the entire session rather than individual utterances.

## Annotation Types

The NTO Pipeline supports two annotation granularities:

### PER_UTTERANCE
Annotations are attached to individual utterances. Each utterance can have multiple annotations.

**Use case**: Coding individual turns (e.g., identifying praise, questions, feedback)

**Example**:
```json
{
  "transcript": [
    {
      "_id": "2",
      "role": "Tutor",
      "content": "Great! Let's start with a simple example.",
      "annotations": [
        {
          "_id": "2",
          "identifiedBy": "AI",
          "given_praise": "Great!"
        }
      ]
    }
  ]
}
```

### PER_SESSION
Annotations are attached at the session level and describe the entire conversation.

**Use case**: Overall session coding (e.g., session quality, learning outcomes, engagement level)

**Example**:
```json
{
  "transcript": [...],
  "annotations": [
    {
      "_id": "0",
      "session_quality": "high",
      "learning_outcome": "achieved",
      "engagement_level": 4
    }
  ]
}
```

## Examples

### Minimal Valid Transcript
```json
{
  "transcript": [
    {
      "_id": "0",
      "role": "Tutor",
      "content": "Hello! Today we're going to work on fractions."
    },
    {
      "_id": "1",
      "role": "Student",
      "content": "Hi! I'm ready to learn."
    }
  ]
}
```

### Complete Example with Timestamps
```json
{
  "transcript": [
    {
      "_id": "0",
      "role": "Tutor",
      "content": "Hello! Today we're going to work on fractions.",
      "session_id": "session_001",
      "sequence_id": "1",
      "start_time": "00:00:00",
      "end_time": "00:00:05",
      "annotations": []
    },
    {
      "_id": "1",
      "role": "Student",
      "content": "Hi! I'm ready to learn.",
      "session_id": "session_001",
      "sequence_id": "2",
      "start_time": "00:00:05",
      "end_time": "00:00:08",
      "annotations": []
    }
  ],
  "leadRole": "Tutor",
  "annotations": []
}
```

### Example with Utterance Annotations
```json
{
  "transcript": [
    {
      "_id": "2",
      "role": "Tutor",
      "content": "Great! Let's start with a simple example.",
      "session_id": "session_001",
      "sequence_id": "3",
      "annotations": [
        {
          "_id": "2",
          "identifiedBy": "AI",
          "given_praise": "Great!"
        }
      ]
    }
  ],
  "leadRole": "Tutor",
  "annotations": []
}
```

## Validation

Transcripts are validated against the JSON Schema at the following points:
1. **File Upload**: When uploading session files to the system
2. **File Conversion**: When converting files to sessions
3. **Before Annotation**: Before running annotation jobs

Invalid transcripts will be rejected with a clear error message indicating:
- Which field failed validation
- What was expected vs. what was found
- The location in the file (utterance index, field path)

## File Naming

Session files should be named descriptively:
- Format: `{identifier}.json`
- Example: `session_001.json`, `math_tutoring_20240115.json`

## Character Encoding

All transcript files must be UTF-8 encoded to support international characters.

## Size Limits

- Maximum file size: 10MB per transcript
- Recommended maximum utterances: 1000 per session
- Very large sessions may impact processing performance

## Common Validation Errors

### Missing Required Fields
```
Error: Utterance at index 5 is missing required field '_id'
```
**Fix**: Ensure every utterance has `_id`, `role`, and `content` fields.

### Invalid JSON
```
Error: Unable to parse JSON: Unexpected token at line 45
```
**Fix**: Validate JSON syntax using a JSON validator before upload.

### Incorrect Data Types
```
Error: Field 'annotations' must be an array, got string
```
**Fix**: Ensure `annotations` is always an array `[]`, even if empty.

## Best Practices

1. **Unique IDs**: Use sequential numeric strings for utterance IDs ("0", "1", "2", etc.)
2. **Consistent Roles**: Use consistent role names throughout a project
3. **Empty Arrays**: Initialize `annotations` as `[]` rather than omitting the field
4. **Timestamps**: Use consistent timestamp formats within a session
5. **Content**: Preserve original punctuation and capitalization in utterance content

## Related Documentation

- [Collection Export Format](./collection-export.md) - CSV export format specification
- [Prompt Configuration](../PROMPTS.md) - How to define annotation schemas
- [Examples](./examples/) - Sample transcript files
