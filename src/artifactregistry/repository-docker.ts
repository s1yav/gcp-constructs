import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export interface RepositoryDockerArgs {
    /**
     * The location/region for the repository.
     */
    location: pulumi.Input<string>;

    /**
     * The user-specified ID of the repository.
     */
    repositoryId: pulumi.Input<string>;

    /**
     * The description for the repository.
     */
    description: pulumi.Input<string>;

    /**
     * Whether repository tags should be immutable (preventing overwrites).
     */
    immutableTags?: pulumi.Input<boolean>;

    /**
     * Whether the cleanup policy is enabled in dry-run mode for the repository.
     */
    cleanupPolicyDryRun?: pulumi.Input<boolean>;

    /**
     * Cleanup policies for this repository indicating when package versions can be deleted.
     */
    cleanupPolicies?: pulumi.Input<pulumi.Input<gcp.types.input.artifactregistry.RepositoryCleanupPolicy>[]>;
}

/**
 * RepositoryDocker Component Resource
 * Provisions a Google Cloud Artifact Registry Docker repository with custom configuration.
 */
export class RepositoryDocker extends pulumi.ComponentResource {
    public readonly repository: gcp.artifactregistry.Repository;

    constructor(name: string, args: RepositoryDockerArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:RepositoryDocker", name, args, opts);

        // Create the Artifact Registry repository specifically for Docker format
        this.repository = new gcp.artifactregistry.Repository(name, {
            location: args.location,
            repositoryId: pulumi.output(args.repositoryId).apply(id => id.toLowerCase()),
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
