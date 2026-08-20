import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export interface IAMCustomRoleArgs {
    /**
     * The unique role ID of the custom role (e.g. "myCustomRole").
     */
    roleId: pulumi.Input<string>;

    /**
     * The human-readable title of the custom role.
     */
    title: pulumi.Input<string>;

    /**
     * The list of GCP IAM permissions to assign to the custom role.
     */
    permissions: pulumi.Input<string[]>;

    /**
     * An optional description of the custom role's purpose.
     */
    description?: pulumi.Input<string>;

    /**
     * The launch stage of the role. Valid values are "ALPHA", "BETA", or "GA". Defaults to "GA".
     */
    stage?: pulumi.Input<string>;
}

/**
 * IAMCustomRole Component Resource
 * Provisions a reusable, parameterized GCP project-level custom IAM role.
 */
export class IAMCustomRole extends pulumi.ComponentResource {
    public readonly role: gcp.projects.IAMCustomRole;

    constructor(name: string, args: IAMCustomRoleArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:IAMCustomRole", name, args, opts);

        // Provision the underlying GCP project-level custom IAM role
        this.role = new gcp.projects.IAMCustomRole(name, {
            roleId: args.roleId,
            title: args.title,
            permissions: args.permissions,
            description: args.description,
            stage: args.stage ?? "GA",
        }, { parent: this });

        this.registerOutputs({
            role: this.role,
        });
    }
}
