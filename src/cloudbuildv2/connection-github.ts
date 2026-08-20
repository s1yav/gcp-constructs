import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as cloudbuildv2 from "@pulumi/gcp/cloudbuildv2";
import * as secretmanager from "@pulumi/gcp/secretmanager";

export interface ConnectionGithubArgs {
    /**
     * The GCP Secret resource ID or name holding the GitHub access token.
     */
    githubAccessTokenId: pulumi.Input<string>;

    /**
     * The name of the connection to create.
     */
    connectionName: pulumi.Input<string>;

    /**
     * The location/region for the connection.
     */
    location: pulumi.Input<string>;

    /**
     * The GitHub App Installation ID.
     */
    appInstallationId: pulumi.Input<number>;

    /**
     * Project ID
     */
    projectId: pulumi.Input<string>;
}

/**
 * Helper to grant the Secret Manager Secret Accessor role to a specific member.
 */
function grantSecretAccessor(
    name: string,
    secretId: pulumi.Input<string>,
    member: pulumi.Input<string>,
    parent: pulumi.Resource
): secretmanager.SecretIamMember {
    return new secretmanager.SecretIamMember(name, {
        secretId: secretId,
        role: "roles/secretmanager.secretAccessor",
        member: member,
    }, { parent: parent });
}

/**
 * ConnectionGithub Component Resource (Cloud Build v2)
 * Provisions a Secret Manager secret with the GitHub token, sets up the IAM permissions for
 * cloudbuild to access it, and creates the cloudbuild Gen 2 connection to GitHub.
 */
export class ConnectionGithub extends pulumi.ComponentResource {
    public readonly connection: cloudbuildv2.Connection;

    constructor(name: string, args: ConnectionGithubArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:ConnectionGithub", name, args, opts);

        // 1. Get/Create the Cloud Build Service Identity
        const legacyCloudbuildServiceIdentity = new gcp.projects.ServiceIdentity(`${name}-identity`, {
            service: "cloudbuild.googleapis.com",
        }, { parent: this });

        // Get the project details to retrieve the project number
        const project = gcp.organizations.getProjectOutput({
            projectId: args.projectId,
        });

        // Construct the second (modern) service identity member: service-PROJECT_NUMBER@gcp-sa-cloudbuild.iam.gserviceaccount.com
        const cloudbuildServiceMemberName = project.number.apply(num => `serviceAccount:service-${num}@gcp-sa-cloudbuild.iam.gserviceaccount.com`);

        // 2. Grant the secretAccessor role to both service identities
        const legacySecretAccessorMember = grantSecretAccessor(
            `${name}-legacy-policy-member`,
            args.githubAccessTokenId,
            legacyCloudbuildServiceIdentity.member,
            this
        );

        const modernSecretAccessorMember = grantSecretAccessor(
            `${name}-modern-policy-member`,
            args.githubAccessTokenId,
            cloudbuildServiceMemberName,
            this
        );

        const oauthTokenSecretVersion = pulumi.all([args.projectId, args.githubAccessTokenId]).apply(([proj, id]) => {
            if (id.startsWith("projects/")) {
                return `${id}/versions/1`;
            }
            return `projects/${proj}/secrets/${id}/versions/1`;
        });

        // 4. Create the cloudbuild Gen 2 Connection
        this.connection = new cloudbuildv2.Connection(name, {
            location: args.location,
            name: args.connectionName,
            githubConfig: {
                appInstallationId: args.appInstallationId,
                authorizerCredential: {
                    oauthTokenSecretVersion,
                },
            },
        }, { parent: this, dependsOn: [legacySecretAccessorMember, modernSecretAccessorMember] });

        // Only exports metadata IDs; the actual secret data remains secure in Secret Manager
        this.registerOutputs({
            connection: this.connection,
        });
    }
}
