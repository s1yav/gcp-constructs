import { ComponentResource, ComponentResourceOptions, Input, Resource, all } from "@pulumi/pulumi";
import { Connection } from "@pulumi/gcp/developerconnect";
import { ServiceIdentity } from "@pulumi/gcp/projects";
import { Secret, SecretIamMember } from "@pulumi/gcp/secretmanager";

export interface ConnectionGithubArgs {
    /**
     * The GCP Secret resource ID or name holding the GitHub access token.
     */
    githubAccessTokenId: Input<string>;

    /**
     * The location/region for the connection.
     */
    location: Input<string>;

    /**
     * The ID of the connection to create.
     */
    connectionId: Input<string>;

    /**
     * The GitHub App Installation ID.
     */
    appInstallationId: Input<string>;

    /**
     * The GCP Project ID.
     */
    projectId: Input<string>;
}

/**
 * Helper to grant the Secret Manager Secret Accessor role to a specific member.
 */
function grantSecretAccessor(
    name: string,
    secretId: Input<string>,
    member: Input<string>,
    parent: Resource
): SecretIamMember {
    return new SecretIamMember(name, {
        secretId: secretId,
        role: "roles/secretmanager.secretAccessor",
        member: member,
    }, { parent: parent });
}

/**
 * ConnectionGithub Component Resource (Developer Connect)
 * Sets up a Developer Connect connection to GitHub, provisions the necessary IAM policy
 * for the Developer Connect service agent to access the GitHub token secret, and links it.
 */
export class ConnectionGithub extends ComponentResource {
    public readonly connection: Connection;

    constructor(name: string, args: ConnectionGithubArgs, opts?: ComponentResourceOptions) {
        super("custom:components:ConnectionGithub", name, args, opts);

        // Get the existing Secret resource using its ID/Path
        const githubAccessTokenSecret = Secret.get(`${name}-access-token`, args.githubAccessTokenId, {}, { parent: this });

        // 1. Get/Create the Developer Connect Service Identity
        const devconnectServiceIdentity = new ServiceIdentity(`${name}-identity`, {
            service: "developerconnect.googleapis.com",
        }, { parent: this });

        // 2. Grant the secretAccessor role to the Developer Connect service agent
        const secretAccessorMember = grantSecretAccessor(
            `${name}-policy-member`,
            githubAccessTokenSecret.secretId,
            devconnectServiceIdentity.member,
            this
        );

        const oauthTokenSecretVersion = all([args.projectId, githubAccessTokenSecret.id]).apply(([proj, id]) => {
            if (id.startsWith("projects/")) {
                return `${id}/versions/1`;
            }
            return `projects/${proj}/secrets/${id}/versions/1`;
        });

        // 4. Create the Developer Connect Connection
        this.connection = new Connection(name, {
            location: args.location,
            connectionId: args.connectionId,
            githubConfig: {
                githubApp: "DEVELOPER_CONNECT",
                appInstallationId: args.appInstallationId,
                authorizerCredential: {
                    oauthTokenSecretVersion,
                },
            },
        }, { parent: this, dependsOn: [secretAccessorMember] });

        this.registerOutputs({
            connection: this.connection,
        });
    }
}
