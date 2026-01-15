# Collection Export Format Specification

This document describes the CSV export format for collections in the NTO Pipeline.

## Overview

Collection exports merge annotations from multiple runs into consolidated CSV files. Each collection export contains:
- **Utterances CSV** (PER_UTTERANCE) or **Sessions CSV** (PER_SESSION)
- **Meta CSV** (run metadata)

All files are packaged in a ZIP archive.

## Export Types

### PER_UTTERANCE Export

Produces utterance-level data with merged annotations from all runs.

**Files included:**
- `{project}-{collection}-utterances.csv`
- `{project}-{collection}-meta.csv`

### PER_SESSION Export

Produces session-level data with merged annotations from all runs.

**Files included:**
- `{project}-{collection}-sessions.csv`
- `{project}-{collection}-meta.csv`

## File Formats

### Utterances CSV (PER_UTTERANCE)

Contains one row per utterance with columns for:
1. Base utterance fields
2. Merged annotations from all runs
3. Metadata columns

**Base Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `_id` | String | Unique utterance identifier within session |
| `sessionId` | String | Session identifier |
| `role` | String | Speaker role (Tutor, Student, etc.) |
| `start_time` | String | Start timestamp (if available) |
| `end_time` | String | End timestamp (if available) |
| `content` | String | Utterance text content |

**Annotation Columns:**

For each annotation field and each run, a column is created with the pattern: `{fieldName}-{runIndex}`

Examples:
- `given_praise-0` - Praise field from first run
- `given_praise-1` - Praise field from second run
- `identifiedBy-0` - IdentifiedBy field from first run
- `code-0`, `code-1`, `code-2` - Code field from three runs

**Metadata Columns:**

For each run, metadata columns are included: `{metadataType}-{runIndex}`

| Column Pattern | Description |
|----------------|-------------|
| `model-{N}` | Model used for run N (e.g., "gpt-4", "claude-opus-4") |
| `annotationType-{N}` | Annotation type for run N (always "PER_UTTERANCE" in this file) |
| `prompt-{N}` | Prompt ID used for run N |
| `promptVersion-{N}` | Prompt version used for run N |

**Example Structure:**

```csv
_id,sessionId,role,start_time,end_time,content,given_praise-0,identifiedBy-0,model-0,annotationType-0,prompt-0,promptVersion-0,given_praise-1,identifiedBy-1,model-1,annotationType-1,prompt-1,promptVersion-1
0,session_001,Tutor,00:00:00,00:00:05,Hello!,,,gpt-4,PER_UTTERANCE,prompt123,1,,,claude-opus-4,PER_UTTERANCE,prompt123,1
1,session_001,Student,00:00:05,00:00:08,Hi!,,,gpt-4,PER_UTTERANCE,prompt123,1,,,claude-opus-4,PER_UTTERANCE,prompt123,1
2,session_001,Tutor,00:00:08,00:00:12,Great!,Great!,AI,gpt-4,PER_UTTERANCE,prompt123,1,Excellent!,AI,claude-opus-4,PER_UTTERANCE,prompt123,1
```

### Sessions CSV (PER_SESSION)

Contains one row per session with columns for:
1. Session identifier
2. Merged annotations from all runs
3. Metadata columns

**Base Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `_id` | String | Session identifier |

**Annotation Columns:**

Same pattern as utterances: `{fieldName}-{runIndex}`

Examples:
- `session_quality-0` - Quality rating from first run
- `session_quality-1` - Quality rating from second run
- `engagement_level-0`, `engagement_level-1` - Engagement from two runs

**Metadata Columns:**

Same pattern as utterances: `{metadataType}-{runIndex}`

**Example Structure:**

```csv
_id,session_quality-0,engagement_level-0,model-0,annotationType-0,prompt-0,promptVersion-0,session_quality-1,engagement_level-1,model-1,annotationType-1,prompt-1,promptVersion-1
session_001,high,4,gpt-4,PER_SESSION,prompt456,1,excellent,5,claude-opus-4,PER_SESSION,prompt456,1
session_002,medium,3,gpt-4,PER_SESSION,prompt456,1,good,4,claude-opus-4,PER_SESSION,prompt456,1
```

### Meta CSV (Always Included)

Contains one row per run with metadata about each annotation run in the collection.

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `project` | String | Project ID |
| `runId` | String | Run ID |
| `runName` | String | Human-readable run name |
| `annotationType` | String | PER_UTTERANCE or PER_SESSION |
| `model` | String | Model code used (e.g., "gpt-4", "claude-opus-4") |
| `prompt` | String | Prompt ID |
| `promptVersion` | Number | Version of the prompt used |
| `sessionsCount` | Number | Number of sessions annotated in this run |

**Example:**

```csv
project,runId,runName,annotationType,model,prompt,promptVersion,sessionsCount
proj123,run001,GPT-4 Praise Detection,PER_UTTERANCE,gpt-4,prompt123,1,50
proj123,run002,Claude Praise Detection,PER_UTTERANCE,claude-opus-4,prompt123,1,50
```

## Annotation Merging Logic

When multiple runs annotate the same data, annotations are merged by matching:

**For PER_UTTERANCE:**
- Match utterances by `_id` AND `sessionId`
- Each run's annotations get a unique index suffix (0, 1, 2, etc.)

**For PER_SESSION:**
- Match sessions by `sessionId`
- Each run's annotations get a unique index suffix (0, 1, 2, etc.)

**Index Assignment:**
- Index 0 = First run in the collection
- Index 1 = Second run in the collection
- Index N = (N+1)th run in the collection

## Empty Values

Missing or empty annotation values are exported as empty strings in CSV:
- If an utterance/session has no annotation from a particular run, that column is empty
- Empty values maintain CSV structure integrity

## File Naming Convention

Files follow this pattern:
- Utterances: `{projectId}-{collectionId}-utterances.csv`
- Sessions: `{projectId}-{collectionId}-sessions.csv`
- Meta: `{projectId}-{collectionId}-meta.csv`
- ZIP: `project-{projectId}-collection-{collectionId}-{collectionName}.zip`

Example:
```
project-696917ca3c43899d31fa86df-collection-696918ab195943bfb702e30a-Math Tutoring Analysis.zip
├── 696917ca3c43899d31fa86df-696918ab195943bfb702e30a-utterances.csv
└── 696917ca3c43899d31fa86df-696918ab195943bfb702e30a-meta.csv
```

## CSV Format Details

- **Encoding**: UTF-8
- **Line Endings**: LF (Unix-style)
- **Delimiter**: Comma (`,`)
- **Quote Character**: Double quote (`"`)
- **Escape**: Double quote for embedded quotes (`""`)
- **Header**: First row contains column names

## Using Exports in Analysis

### Python (pandas)

```python
import pandas as pd
import zipfile

# Extract and read
with zipfile.ZipFile('collection-export.zip', 'r') as zip_ref:
    zip_ref.extractall('extracted/')

utterances = pd.read_csv('extracted/project-collection-utterances.csv')
meta = pd.read_csv('extracted/project-collection-meta.csv')

# Access annotations from different runs
utterances['given_praise-0']  # First run
utterances['given_praise-1']  # Second run

# Compare annotations across runs
comparison = utterances[['_id', 'content', 'given_praise-0', 'given_praise-1']]
```

### R

```r
library(readr)
library(zip)

# Extract and read
unzip("collection-export.zip", exdir = "extracted")

utterances <- read_csv("extracted/project-collection-utterances.csv")
meta <- read_csv("extracted/project-collection-meta.csv")

# Access annotations
utterances$`given_praise-0`
utterances$`given_praise-1`
```

### Excel

1. Extract ZIP file
2. Open CSV in Excel (Data → From Text/CSV)
3. Ensure UTF-8 encoding is selected
4. Columns will preserve their numeric suffixes

## Common Use Cases

### Inter-Rater Reliability

Compare annotations from multiple runs (different models, prompts, or human coders):

```python
# Calculate agreement between two runs
from sklearn.metrics import cohen_kappa_score

df = pd.read_csv('utterances.csv')
kappa = cohen_kappa_score(df['code-0'], df['code-1'])
print(f"Cohen's Kappa: {kappa}")
```

### Model Comparison

Compare different models' performance on the same data:

```python
# Get model information from meta
meta = pd.read_csv('meta.csv')
print(f"Run 0: {meta.loc[0, 'model']}")
print(f"Run 1: {meta.loc[1, 'model']}")

# Compare annotations
utterances = pd.read_csv('utterances.csv')
comparison = utterances[['content', 'given_praise-0', 'given_praise-1']]
```

### Consensus Coding

Combine annotations from multiple runs to create consensus labels:

```python
# Simple majority vote
df['praise_consensus'] = df[['given_praise-0', 'given_praise-1', 'given_praise-2']].mode(axis=1)[0]
```

## Size Limits

- Maximum rows per CSV: 1,000,000
- Maximum file size per CSV: 500MB
- Maximum ZIP size: 1GB

Very large exports may take longer to generate and download.

## Troubleshooting

### Excel Opens With Garbled Characters

**Issue**: Special characters appear incorrectly
**Solution**: Import as UTF-8 encoded file rather than opening directly

### Missing Columns

**Issue**: Some annotation columns are empty
**Solution**: This is expected if that run didn't produce annotations for certain utterances/sessions

### Column Order

**Issue**: Columns appear in unexpected order
**Solution**: Base columns appear first, then annotation columns (alphabetically), then metadata columns

## Related Documentation

- [Transcript Format](./transcript.md) - Input format specification
- [Creating Collections](../COLLECTIONS.md) - How to create and manage collections
- [Annotation Types](../ANNOTATIONS.md) - Understanding PER_UTTERANCE vs PER_SESSION
