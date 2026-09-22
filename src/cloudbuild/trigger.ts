import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate } from "@pulumi/pulumi";
import { Trigger as GcpTrigger } from "@pulumi/gcp/cloudbuild";
import type { input } from "@pulumi/gcp/types";

export interface TriggerArgs {
    /**
     * The GCP Project ID.
     */
    projectId: Input<string>;

    /**
     * The location/region for the trigger.
     */
    location: Input<string>;

    /**
     * The resource ID of the Cloud Build repository.
     */
    repository: Input<string>;

    /**
     * Regex pattern of branches to trigger builds (e.g. "feature-.*").
     */
    branchFilter: Input<string>;

    /**
     * The path to the Cloud Build configuration file in the repository (e.g. "cloudbuild.yaml").
     */
    filename: Input<string>;

    /**
     * The pull request trigger configuration for repository.
     */
    pullRequest?: Input<input.cloudbuild.TriggerRepositoryEventConfigPullRequest> | undefined;

    /**
     * The commit push trigger configuration for repository.
     */
    push?: Input<input.cloudbuild.TriggerRepositoryEventConfigPush> | undefined;

    /**
     * The service account used for trigger execution.
     * Must be a user-managed service account (e.g. name@project.iam.gserviceaccount.com).
     */
    serviceAccount: Input<string>;

    /**
     * Map of user-defined substitutions for the trigger.
     * Keys must start with an underscore (e.g. "_ARTIFACT_REGISTRY_NAME").
     */
    substitutions?: Input<{ [key: string]: Input<string> }>;

    /**
     * Files to include in the trigger (glob patterns).
     */
    includedFiles?: Input<Input<string>[]>;

    /**
     * Files to ignore in the trigger (glob patterns).
     */
    ignoredFiles?: Input<Input<string>[]>;
}

/**
 * Resolves the service account used for trigger execution.
 * Formats the provided service account ID to the full GCP resource name path.
 */
function resolveServiceAccount(projectId: Input<string>, serviceAccount: Input<string>): Output<string> {
    return interpolate`projects/${projectId}/serviceAccounts/${serviceAccount}`;
}

/**
 * Trigger Component Resource
 * Provisions a Google Cloud Build trigger linked to GitHub repository push events.
 */
export class Trigger extends ComponentResource {
    public readonly trigger: GcpTrigger;

    constructor(name: string, args: TriggerArgs, opts?: ComponentResourceOptions) {
        super("custom:components:Trigger", name, args, opts);

        // Resolve the service account to be used for the trigger execution
        const serviceAccount = resolveServiceAccount(args.projectId, args.serviceAccount);

        // Create the Cloud Build trigger linked to repository push events
        this.trigger = new GcpTrigger(name, {
            location: args.location,
            repositoryEventConfig: {
                repository: args.repository,
                push: args.push,
                pullRequest: args.pullRequest,
            },
            filename: args.filename,
            serviceAccount: serviceAccount,
            substitutions: args.substitutions,
            includedFiles: args.includedFiles,
            ignoredFiles: args.ignoredFiles,
        }, { parent: this });

        this.registerOutputs({
            trigger: this.trigger,
        });
    }
}
