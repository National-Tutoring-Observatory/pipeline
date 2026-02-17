# Evaluations Module

Evaluations compare multiple annotation runs from the same RunSet. They validate that runs are compatible (same sessions, overlapping annotation fields), then group them for inter-rater agreement analysis (Cohen's Kappa, Precision/Recall/F1).

## Data Model

```
Evaluation
  ├── name: string
  ├── project: ObjectId (ref: Project)
  ├── runSet: ObjectId (ref: RunSet)
  ├── baseRun: ObjectId (ref: Run)        — the reference run all others compare against
  ├── runs: [ObjectId] (ref: Run)          — ALL runs including baseRun
  ├── isExporting / hasExportedCSV / hasExportedJSONL — export tracking
  ├── createdAt / createdBy
  └── updatedAt / updatedBy
```

Schema: `app/lib/schemas/evaluation.schema.ts`
Types: `evaluations.types.ts`

## Compatibility Rules

Two runs are "compatible" when:

1. **Same sessions** — identical session ID lists (checked via `sessionsMatch()` from runSets module)
2. **Shared annotation fields** — at least one non-system field key in common (compared from `run.snapshot.prompt.annotationSchema`)

Helper: `helpers/getEvaluationCompatibleRuns.ts` — filters runs compatible with a given base run.

## Routes

| Path                                                      | File                                             | Purpose                      |
| --------------------------------------------------------- | ------------------------------------------------ | ---------------------------- |
| `:projectId/run-sets/:runSetId/evaluations`               | `runSets/containers/runSetEvaluations.route.tsx` | List (paginated, searchable) |
| `:projectId/run-sets/:runSetId/create-evaluation`         | `containers/evaluationCreate.route.tsx`          | Creation form                |
| `:projectId/run-sets/:runSetId/evaluations/:evaluationId` | `containers/evaluation.route.tsx`                | Detail view                  |

## Creation Flow

1. User selects a **base run** (single select, left column)
2. Compatible runs auto-populate in right column (multi-select with checkboxes)
3. `annotationSchemaFieldCounts` shows which fields overlap and how many runs share each
4. Payload sends `{ name, baseRun, selectedRuns }` separately — action combines into `runs: [baseRun, ...selectedRuns]`
5. Server validates: runs exist, compatibility confirmed via `getEvaluationCompatibleRuns()`

## Key Helpers

- `isAbleToCreateEvaluation(runSet)` — requires >= 2 runs in the RunSet
- `getEvaluationCompatibleRuns(runs, baseRunId)` — returns runs compatible with base run
- `getAnnotationSchemaFieldCounts(runs, baseRunId, compatibleRuns)` — field-level overlap stats

## Authorization

- **View**: `ProjectAuthorization.canView()` — see evaluations list and detail
- **Create**: `ProjectAuthorization.Runs.canManage()` — required to create evaluations

## Components

- `evaluationCreate.tsx` — main form layout with sticky footer action bar
- `evaluationCreateRunsSelector.tsx` — two-column layout container
- `evaluationCreateBaseRunSelector.tsx` — left column, single-select with Item components
- `evaluationCreateCompatibleRunsSelector.tsx` — right column, multi-select with checkboxes
- `evaluationCreateAnnotationSchemaDisplay.tsx` — field compatibility breakdown
- `evaluation.tsx` — detail view (minimal, placeholder for future analytics)

## Metrics Reference

`documentation/evaluation-equations.md` contains TypeScript implementations for:

- Cohen's Kappa (inter-rater agreement)
- Precision / Recall / F1 (macro-averaged)
- Mean Kappa (aggregate across run pairs)
