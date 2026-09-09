import { ComponentResource, ComponentResourceOptions, Input, interpolate } from "@pulumi/pulumi";
import { Repository } from "@pulumi/gcp/cloudbuildv2";

export interface RepositoryGithubArgs {
    /**
     * The GitHub username or organization name.
     */
    githubUsername: Input<string>;

    /**
     * The name of the GitHub repository.
     */
    githubRepoName: Input<string>;

    /**
     * The resource ID of the parent Cloud Build connection.
     * (e.g. projects/project-id/locations/location/connections/connection-name)
     */
    parentConnection: Input<string>;

    /**
     * The location/region for the repository link.
     */
    location: Input<string>;

    /**
     * The name of the repository resource in Google Cloud Build.
     */
    repoName: Input<string>;
}

/**
 * RepositoryGithub Component Resource
 * Links a GitHub repository to an existing Cloud Build Gen 2 connection.
 */
export class RepositoryGithub extends ComponentResource {
    public readonly repository: Repository;

    constructor(name: string, args: RepositoryGithubArgs, opts?: ComponentResourceOptions) {
        super("custom:components:RepositoryGithub", name, args, opts);

        // Link the GitHub repository to the parent Cloud Build Connection
        this.repository = new Repository(name, {
            location: args.location,
            name: args.repoName,
            parentConnection: args.parentConnection,
            remoteUri: interpolate`https://github.com/${args.githubUsername}/${args.githubRepoName}.git`,
        }, { parent: this });

        this.registerOutputs({
            repository: this.repository,
        });
    }
}
