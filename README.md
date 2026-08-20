# gcp-constructs

Reusable Pulumi Google Cloud Platform (GCP) Component Constructs.

## Constructs

- **`artifactregistry`**: `RepositoryDocker`
- **`cloudbuild`**: `Trigger`
- **`cloudbuildv2`**: `ConnectionGithub`, `RepositoryGithub`
- **`cloudrunv2`**: `Service`
- **`developerconnect`**: `ConnectionGithub`
- **`projects`**: `IAMCustomRole`, `Service`
- **`serviceaccount`**: `Account`

## Installation

```bash
npm install gcp-constructs
```

## Usage

```typescript
import { Account, Service as CloudRunv2Service, Trigger } from "gcp-constructs";
```

or via subpaths:

```typescript
import { Account } from "gcp-constructs/serviceaccount/account";
import { Service as CloudRunv2Service } from "gcp-constructs/cloudrunv2/service";
```
