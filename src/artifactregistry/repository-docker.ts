import { ComponentResource, ComponentResourceOptions, Input, output } from "@pulumi/pulumi";
import { Repository } from "@pulumi/gcp/artifactregistry";
import type { input } from "@pulumi/gcp/types";

export interface RepositoryDockerArgs {
    /**
     * The location/region for the repository.
     */
    location: Input<string>;

    /**
     * The user-specified ID of the repository.
     */
    repositoryId: Input<string>;

    /**
     * The description for the repository.
     */
    description: Input<string>;

    /**
     * Whether repository tags should be immutable (preventing overwrites).
     */
    immutableTags?: Input<boolean>;

    /**
     * Whether the cleanup policy is enabled in dry-run mode for the repository.
     */
    cleanupPolicyDryRun?: Input<boolean>;

    /**
     * Cleanup policies for this repository indicating when package versions can be deleted.
     */
    cleanupPolicies?: Input<Input<input.artifactregistry.RepositoryCleanupPolicy>[]>;
}

/**
 * RepositoryDocker Component Resource
 * Provisions a Google Cloud Artifact Registry Docker repository with custom configuration.
 */
export class RepositoryDocker extends ComponentResource {
    public readonly repository: Repository;

    constructor(name: string, args: RepositoryDockerArgs, opts?: ComponentResourceOptions) {
        super("custom:components:RepositoryDocker", name, args, opts);

        // Create the Artifact Registry repository specifically for Docker format
        this.repository = new Repository(name, {
            location: args.location,
            repositoryId: output(args.repositoryId).apply(id => id.toLowerCase()),
            description: args.description,
            format: "DOCKER",
            dockerConfig: {
                immutableTags: args.immutableTags ?? true,
            },
            cleanupPolicyDryRun: args.cleanupPolicyDryRun,
            cleanupPolicies: args.cleanupPolicies,
        }, { parent: this });

        this.registerOutputs({
            repository: this.repository,
        });
    }
}
