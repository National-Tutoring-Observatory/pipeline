# MTM Dataset

Internal guide for preparing and releasing the MTM tutoring dataset.

## Source data format

The `--input` folder must contain one JSON file per session. Each file must have:

| Field        | Type   | Description                                                                      |
| ------------ | ------ | -------------------------------------------------------------------------------- |
| `id`         | string | Session identifier — used as the filename and as `session_id` on every utterance |
| `transcript` | string | Utterances as newline-separated `role: content` lines                            |

Additional fields (e.g. `redacted_transcript`, `spans`) are ignored.

Example (`3fa80047_line811.json`):

```json
{
  "id": "3fa80047_line811",
  "transcript": "volunteer: Hello!\nstudent: Hi\nvolunteer: What do you need help with?"
}
```

## Prepare

Converts the source files into session fixtures and a versioned sample for S3.

```bash
# Auto-detects next version from staging (recommended)
yarn dataset:prepare-mtm --input ../deidentify/datasets/ground-truth-verified-redacted

# Or specify explicitly
yarn dataset:prepare-mtm --input ../deidentify/datasets/ground-truth-verified-redacted --version 2
```

Outputs:

- `datasets/mtm/fixtures/` — 50 sample sessions for local dev/seeding
- `storage/datasets/mtm/v<N>/` — full sample + manifest for S3 sync

## Validate locally

```bash
yarn seeds --dataset
```

Seeds the local database with the dataset. Then start the app, open the seeded project, run a session export, and verify that utterances have `session_id` populated correctly.

## AWS credentials

Preparing and releasing requires AWS credentials with read/write access to the
`staging.nto` and `prod.nto` S3 buckets. How to obtain these credentials is
outside the scope of this document — contact your team lead.

Credentials must be configured via the standard AWS CLI mechanisms
(e.g. `~/.aws/credentials` or instance role). Do **not** add them to `.env` —
the prepare and release scripts intentionally run outside the app's local
environment to avoid conflicts with LocalStack.

If you use named profiles, prefix commands with `AWS_PROFILE`:

```bash
AWS_PROFILE=your-profile yarn dataset:prepare-mtm --input <folder>
```

The prepare script will print the exact release command to run at the end of its output.

## Release

```bash
yarn dataset:release-mtm --version <N>
```

1. Syncs `storage/datasets/mtm/v<N>/` to staging S3
2. Updates `latest.json` on staging → pauses for manual verification
3. On confirmation, syncs staging → prod

**Staging verification**

- Create a new project on staging
- Import the MTM dataset
- Start a run and let it annotate a few sessions

The script guards against releasing a version ≤ the current staging version.

## Commit the fixtures

After preparing, commit the updated `datasets/mtm/fixtures/` so local seeds stay in sync:

```bash
git add datasets/mtm/fixtures/
git commit -m "Update MTM fixtures to v<N>"
```
