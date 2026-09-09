import { ComponentResource, ComponentResourceOptions, Input } from "@pulumi/pulumi";
import { IAMCustomRole as GcpIAMCustomRole } from "@pulumi/gcp/projects";

export interface IAMCustomRoleArgs {
    /**
     * The unique role ID of the custom role (e.g. "myCustomRole").
     */
    roleId: Input<string>;

    /**
     * The human-readable title of the custom role.
     */
    title: Input<string>;

    /**
     * The list of GCP IAM permissions to assign to the custom role.
     */
    permissions: Input<string[]>;

    /**
     * An optional description of the custom role's purpose.
     */
    description?: Input<string>;

    /**
     * The launch stage of the role. Valid values are "ALPHA", "BETA", or "GA". Defaults to "GA".
     */
    stage?: Input<string>;
}

/**
 * IAMCustomRole Component Resource
 * Provisions a reusable, parameterized GCP project-level custom IAM role.
 */
export class IAMCustomRole extends ComponentResource {
    public readonly role: GcpIAMCustomRole;

    constructor(name: string, args: IAMCustomRoleArgs, opts?: ComponentResourceOptions) {
        super("custom:components:IAMCustomRole", name, args, opts);

        // Provision the underlying GCP project-level custom IAM role
        this.role = new GcpIAMCustomRole(name, {
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
