<html><head></head><body><h1>NTO CI/CD Workflow Documentation</h1>
<h2>Overview</h2>
<p>The National Tutoring Observatory uses GitHub Actions for automated deployment of its application to AWS ECS (Elastic Container Service). The CI/CD architecture is split across two repositories:</p>
<ul>
<li><strong><code>pipeline</code></strong> — the application repository, containing environment-specific caller workflows (<code>staging.yml</code>, <code>release.yml</code>)</li>
<li><strong><code>workflows</code></strong> — a shared repository of reusable GitHub Actions workflows that contain the actual deployment logic</li>
</ul>
<p>This separation keeps deployment logic consistent across environments, reduces duplication, and allows changes to be tested in staging before being promoted to production.</p>
<hr>
<h2>Architecture</h2>
<h3>Repository Structure</h3>
<pre><code>National-Tutoring-Observatory/
├── pipeline/                          # Application code + caller workflows
│   └── .github/workflows/
│       ├── staging.yml                # Deploys to staging on push to main
│       └── release.yml                # Deploys to production on release tag
│
└── workflows/                         # Reusable workflow library
    └── .github/workflows/
        ├── resolve_release.yml        # Validates release tags and branch origin
        ├── ecs_preflight.yml          # Waits for ECS service stability
        ├── ecs_build_image.yml        # Builds + pushes container image to ECR
        ├── ecs_deploy_service.yml     # Deploys image to an ECS service
        └── deployment_summary.yml     # Outputs a formatted deployment summary
</code></pre>
<h3>How It Works</h3>
<p>Caller workflows in <code>pipeline</code> invoke reusable workflows from <code>workflows</code> via the <code>uses:</code> keyword with <code>workflow_call</code>. Each reusable workflow is environment-agnostic and fully parameterised — the caller passes in the environment name, secrets, and any service-specific configuration.</p>
<pre><code>Caller (pipeline)                     Reusable (workflows)
┌─────────────┐                       ┌──────────────────────┐
│ staging.yml │──uses:───────────────▶│ ecs_preflight.yml    │
│             │──uses:───────────────▶│ ecs_build_image.yml  │
│             │──uses:───────────────▶│ ecs_deploy_service.yml│
│             │──uses:───────────────▶│ deployment_summary.yml│
└─────────────┘                       └──────────────────────┘
</code></pre>
<hr>
<h2>Staging Pipeline</h2>
<p><strong>File:</strong> <code>pipeline/.github/workflows/staging.yml</code></p>
<p><strong>Triggers:</strong></p>
<ul>
<li>Push to <code>main</code> branch (automatic)</li>
<li>Manual dispatch via <code>workflow_dispatch</code></li>
</ul>
<p><strong>Concurrency:</strong> Only one staging deployment runs at a time. If a new push arrives while a deployment is in progress, the in-progress run is cancelled (<code>cancel-in-progress: true</code>).</p>
<h3>Job Graph</h3>
<pre><code>preflight
├──▶ build-web-staging ──▶ deploy-web-staging ──┐
└──▶ build-worker-staging ──▶ deploy-worker-staging ──┤
                                                      └──▶ staging-summary
</code></pre>
<h3>Jobs</h3>

| Job                   | Reusable Workflow      | Purpose                                                                                                                        |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| preflight             | ecs_preflight.yml      | Confirms ECS services are stable before starting the deployment. Prevents deploying on top of a failed or in-progress rollout. |
| build-web-staging     | ecs_build_image.yml    | Builds the web application container from Dockerfile and pushes it to ECR.                                                     |
| build-worker-staging  | ecs_build_image.yml    | Builds the background worker container from workers/Dockerfile and pushes it to ECR with a -worker suffix.                     |
| deploy-web-staging    | ecs_deploy_service.yml | Deploys the newly built web image to the ECS web service.                                                                      |
| deploy-worker-staging | ecs_deploy_service.yml | Deploys the newly built worker image to the ECS worker service.                                                                |
| staging-summary       | deployment_summary.yml | Outputs a formatted summary of the deployment including both image tags and the application URL.                               |

<p>Both services are built and deployed in parallel after the preflight check passes.</p>
<hr>
<h2>Deployment Flow Summary</h2>
<h3>Staging (Automatic)</h3>
<ol>
<li>Developer merges PR into <code>main</code></li>
<li><code>staging.yml</code> triggers automatically</li>
<li>Preflight confirms ECS is stable</li>
<li>Web and worker images are built in parallel</li>
<li>Each image is deployed to its respective ECS service</li>
<li>Summary is posted to the GitHub Actions run</li>
</ol>
<h3>Production (Manual Release)</h3>
<ol>
<li>Developer creates a semantic version tag (e.g., <code>v1.2.3</code>) from <code>main</code></li>
<li><code>release.yml</code> triggers on the tag push</li>
<li>Release validation confirms the tag format and branch origin</li>
<li>Preflight confirms ECS services are stable</li>
<li>Web and worker images are built in parallel</li>
<li><strong>Deploy jobs are currently disabled</strong> — they will be re-enabled and tested during the next release cycle to avoid updating production during initial workflow validation</li>
<li>Summary is posted to the GitHub Actions run</li>
</ol>
<hr>
<h2>Design Principles</h2>
<ul>
<li><strong>Environment-agnostic reusable workflows</strong> — the same build and deploy logic is used for staging and production, parameterised by environment</li>
<li><strong>No hard-coded values in shared workflows</strong> — all configuration is passed via inputs and secrets</li>
<li><strong>Concurrency controls</strong> — staging uses <code>cancel-in-progress</code> to avoid queuing stale deployments</li>
<li><strong>Preflight safety</strong> — every deployment starts with a stability check to avoid compounding failures</li>
<li><strong>OIDC authentication</strong> — no long-lived AWS credentials in GitHub</li>
</ul>
<hr>
<h2>Related Links</h2>
<ul>
<li><a href="https://github.com/National-Tutoring-Observatory/workflows">Reusable workflows repository</a></li>
<li><a href="https://github.com/National-Tutoring-Observatory/pipeline">Pipeline repository</a></li>
<li><a href="https://github.com/National-Tutoring-Observatory/pipeline/pull/1407">Release refactor PR #1407</a></li>
<li><a href="https://github.com/National-Tutoring-Observatory/infrastructure/issues/86">Infrastructure issue #86</a></li>
</ul></body></html># NTO CI/CD Workflow Documentation

## Overview

The National Tutoring Observatory uses GitHub Actions for automated deployment of its application to AWS ECS (Elastic Container Service). The CI/CD architecture is split across two repositories:

- **`pipeline`** — the application repository, containing environment-specific caller workflows (`staging.yml`, `release.yml`)
- **`workflows`** — a shared repository of reusable GitHub Actions workflows that contain the actual deployment logic

This separation keeps deployment logic consistent across environments, reduces duplication, and allows changes to be tested in staging before being promoted to production.

---

## Architecture

### Repository Structure

```
National-Tutoring-Observatory/
├── pipeline/                          # Application code + caller workflows
│   └── .github/workflows/
│       ├── staging.yml                # Deploys to staging on push to main
│       └── release.yml                # Deploys to production on release tag
│
└── workflows/                         # Reusable workflow library
    └── .github/workflows/
        ├── resolve_release.yml        # Validates release tags and branch origin
        ├── ecs_preflight.yml          # Waits for ECS service stability
        ├── ecs_build_image.yml        # Builds + pushes container image to ECR
        ├── ecs_deploy_service.yml     # Deploys image to an ECS service
        └── deployment_summary.yml     # Outputs a formatted deployment summary
```

### How It Works

Caller workflows in `pipeline` invoke reusable workflows from `workflows` via the `uses:` keyword with `workflow_call`. Each reusable workflow is environment-agnostic and fully parameterised — the caller passes in the environment name, secrets, and any service-specific configuration.

```
Caller (pipeline)                     Reusable (workflows)
┌─────────────┐                       ┌──────────────────────┐
│ staging.yml │──uses:───────────────▶│ ecs_preflight.yml    │
│             │──uses:───────────────▶│ ecs_build_image.yml  │
│             │──uses:───────────────▶│ ecs_deploy_service.yml│
│             │──uses:───────────────▶│ deployment_summary.yml│
└─────────────┘                       └──────────────────────┘
```

---

## Staging Pipeline

**File:** `pipeline/.github/workflows/staging.yml`

**Triggers:**

- Push to `main` branch (automatic)
- Manual dispatch via `workflow_dispatch`

**Concurrency:** Only one staging deployment runs at a time. If a new push arrives while a deployment is in progress, the in-progress run is cancelled (`cancel-in-progress: true`).

### Job Graph

```
preflight
├──▶ build-web-staging ──▶ deploy-web-staging ──┐
└──▶ build-worker-staging ──▶ deploy-worker-staging ──┤
                                                      └──▶ staging-summary
```

### Jobs

| Job                     | Reusable Workflow        | Purpose                                                                                                                        |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `preflight`             | `ecs_preflight.yml`      | Confirms ECS services are stable before starting the deployment. Prevents deploying on top of a failed or in-progress rollout. |
| `build-web-staging`     | `ecs_build_image.yml`    | Builds the web application container from `Dockerfile` and pushes it to ECR.                                                   |
| `build-worker-staging`  | `ecs_build_image.yml`    | Builds the background worker container from `workers/Dockerfile` and pushes it to ECR with a `-worker` suffix.                 |
| `deploy-web-staging`    | `ecs_deploy_service.yml` | Deploys the newly built web image to the ECS `web` service.                                                                    |
| `deploy-worker-staging` | `ecs_deploy_service.yml` | Deploys the newly built worker image to the ECS `worker` service.                                                              |
| `staging-summary`       | `deployment_summary.yml` | Outputs a formatted summary of the deployment including both image tags and the application URL.                               |

### Key Configuration

- **Permissions:** `id-token: write` (for OIDC authentication with AWS), `contents: read`, `actions: read`
- **Authentication:** AWS role ARN is passed from GitHub repository variables (`vars.AWS_ROLE_ARN`)
- **Application URL:** https://staging.app.nationaltutoringobservatory.org/

---

## Production Pipeline (Release)

**File:** `pipeline/.github/workflows/release.yml`

**Status:** The production pipeline has been refactored to use the same reusable workflows as staging — see [PR #1407](https://github.com/National-Tutoring-Observatory/pipeline/pull/1407). The deploy jobs (`deploy-web` and `deploy-worker`) are currently commented out to avoid updating production during initial validation. Only the resolve, preflight, and build stages are active. The deploy jobs will be re-enabled and tested during the next production release cycle.

**Trigger:** Semantic version tag push (e.g., `v1.2.3`)

### Current Job Graph

The resolve, preflight, and build stages are active. The deploy stages are disabled until the next release cycle.

```
resolve ──▶ preflight
            ├──▶ build-web ──┐
            └──▶ build-worker ──┤
                                └──▶ production-summary
```

### Target Job Graph

Once the deploy jobs are re-enabled, the full pipeline will mirror staging with the addition of a release validation step:

```
resolve ──▶ preflight
            ├──▶ build-web ──▶ deploy-web ──┐
            └──▶ build-worker ──▶ deploy-worker ──┤
                                                   └──▶ production-summary
```

The `resolve_release.yml` reusable workflow validates that the semantic version tag is well-formed and that the tagged commit originates from the `main` branch. This acts as a policy enforcement point to prevent deploying unreviewed code.

---

## Reusable Workflows Reference

All reusable workflows live in `National-Tutoring-Observatory/workflows` and are called with `@main`.

### `resolve_release.yml`

Validates semantic version tags and ensures the release commit comes from the `main` branch. Used as the entry point for production deployments to enforce release policy.

**Used by:** Production release pipeline

### `ecs_preflight.yml`

Waits for an ECS service to reach a stable state before continuing. This ensures no in-progress or failed rollouts are active, preventing deployments from stacking on top of problematic states.

**Inputs:**
| Input | Description |
|-------|-------------|
| `environment` | Target environment (e.g., `staging`, `production`) |

**Secrets:**
| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |

### `ecs_build_image.yml`

Builds a container image and pushes it to AWS ECR.

**Inputs:**
| Input | Description |
|-------|-------------|
| `environment` | Target environment |
| `dockerfile` | Path to the Dockerfile (e.g., `Dockerfile`, `workers/Dockerfile`) |
| `image-suffix` | Suffix appended to the image name (e.g., `""`, `"-worker"`) |
| `output-name` | Name for the output variable containing the built image URI |

**Outputs:**
| Output | Description |
|--------|-------------|
| `image` | Full ECR image URI of the built image |

**Secrets:**
| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |

### `ecs_deploy_service.yml`

Deploys a container image to an ECS service by updating the task definition and triggering a rolling update.

**Inputs:**
| Input | Description |
|-------|-------------|
| `environment` | Target environment |
| `image` | Full ECR image URI to deploy |
| `service` | ECS service name (e.g., `web`, `worker`) |

**Secrets:**
| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |

### `deployment_summary.yml`

Generates a formatted GitHub Actions job summary at the end of a deployment run. Intended to be the final job in any caller workflow.

**Inputs:**
| Input | Description |
|-------|-------------|
| `environment` | Target environment |
| `web-image` | ECR image URI of the deployed web container |
| `worker-image` | ECR image URI of the deployed worker container |
| `app-url` | URL of the deployed application |

---

## Authentication

All workflows use **OIDC (OpenID Connect)** to authenticate with AWS. This avoids storing long-lived AWS credentials as GitHub secrets.

- The `id-token: write` permission is required at the workflow level
- The AWS role ARN is stored as a **GitHub repository variable** (`vars.AWS_ROLE_ARN`), not a secret, since the ARN itself is not sensitive
- Each reusable workflow receives the role ARN via the `secrets` parameter

---

## Services Deployed

The application consists of two ECS services:

| Service  | Dockerfile           | Description               |
| -------- | -------------------- | ------------------------- |
| `web`    | `Dockerfile`         | The main web application  |
| `worker` | `workers/Dockerfile` | Background job processing |

Both services are built and deployed in parallel after the preflight check passes.

---

## Deployment Flow Summary

### Staging (Automatic)

1. Developer merges PR into `main`
2. `staging.yml` triggers automatically
3. Preflight confirms ECS is stable
4. Web and worker images are built in parallel
5. Each image is deployed to its respective ECS service
6. Summary is posted to the GitHub Actions run

### Production (Manual Release)

1. Developer creates a semantic version tag (e.g., `v1.2.3`) from `main`
2. `release.yml` triggers on the tag push
3. Release validation confirms the tag format and branch origin
4. Preflight confirms ECS services are stable
5. Web and worker images are built in parallel
6. **Deploy jobs are currently disabled** — they will be re-enabled and tested during the next release cycle to avoid updating production during initial workflow validation
7. Summary is posted to the GitHub Actions run

---

## Design Principles

- **Environment-agnostic reusable workflows** — the same build and deploy logic is used for staging and production, parameterised by environment
- **No hard-coded values in shared workflows** — all configuration is passed via inputs and secrets
- **Concurrency controls** — staging uses `cancel-in-progress` to avoid queuing stale deployments
- **Preflight safety** — every deployment starts with a stability check to avoid compounding failures
- **OIDC authentication** — no long-lived AWS credentials in GitHub

---

## Related Links

- [[Reusable workflows repository](https://github.com/National-Tutoring-Observatory/workflows)](https://github.com/National-Tutoring-Observatory/workflows)
- [[Pipeline repository](https://github.com/National-Tutoring-Observatory/pipeline)](https://github.com/National-Tutoring-Observatory/pipeline)
- [[Release refactor PR #1407](https://github.com/National-Tutoring-Observatory/pipeline/pull/1407)](https://github.com/National-Tutoring-Observatory/pipeline/pull/1407)
- [[Infrastructure issue #86](https://github.com/National-Tutoring-Observatory/infrastructure/issues/86)](https://github.com/National-Tutoring-Observatory/infrastructure/issues/86)
