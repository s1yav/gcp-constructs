import * as pulumi from "@pulumi/pulumi";
import * as cloudbuild from "@pulumi/gcp/cloudbuild";
import * as input from "@pulumi/gcp/types/input";

export interface TriggerArgs {
    /**
     * The GCP Project ID.
     */
    projectId: pulumi.Input<string>;

    /**
     * The location/region for the trigger.
     */
    location: pulumi.Input<string>;

    /**
     * The resource ID of the Cloud Build repository.
     */
    repository: pulumi.Input<string>;

    /**
     * Regex pattern of branches to trigger builds (e.g. "feature-.*").
     */
    branchFilter: pulumi.Input<string>;

    /**
     * The path to the Cloud Build configuration file in the repository (e.g. "cloudbuild.yaml").
     */
    filename: pulumi.Input<string>;

    /**
     * The pull request trigger configuration for repository.
     */
    pullRequest?: pulumi.Input<input.cloudbuild.TriggerRepositoryEventConfigPullRequest> | undefined;

    /**
     * The commit push trigger configuration for repository.
     */
    push?: pulumi.Input<input.cloudbuild.TriggerRepositoryEventConfigPush> | undefined;

    /**
     * The service account used for trigger execution.
     * Must be a user-managed service account (e.g. name@project.iam.gserviceaccount.com).
     */
    serviceAccount: pulumi.Input<string>;

    /**
     * Map of user-defined substitutions for the trigger.
     * Keys must start with an underscore (e.g. "_ARTIFACT_REGISTRY_NAME").
     */
    substitutions?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

/**
 * Resolves the service account used for trigger execution.
 * Formats the provided service account ID to the full GCP resource name path.
 */
function resolveServiceAccount(projectId: pulumi.Input<string>, serviceAccount: pulumi.Input<string>): pulumi.Output<string> {
    return pulumi.interpolate`projects/${projectId}/serviceAccounts/${serviceAccount}`;
}

/**
 * Trigger Component Resource
 * Provisions a Google Cloud Build trigger linked to GitHub repository push events.
 */
export class Trigger extends pulumi.ComponentResource {
    public readonly trigger: cloudbuild.Trigger;

    constructor(name: string, args: TriggerArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:Trigger", name, args, opts);

        // Resolve the service account to be used for the trigger execution
        const serviceAccount = resolveServiceAccount(args.projectId, args.serviceAccount);

        // Create the Cloud Build trigger linked to repository push events
        this.trigger = new cloudbuild.Trigger(name, {
            location: args.location,
            repositoryEventConfig: {
                repository: args.repository,
                push: args.push,
                pullRequest: args.pullRequest,
            },
            filename: args.filename,
            serviceAccount: serviceAccount,
            substitutions: args.substitutions,
        }, { parent: this });

        this.registerOutputs({
            trigger: this.trigger,
        });
    }
}
