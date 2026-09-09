import { ComponentResource, ComponentResourceOptions, Input } from "@pulumi/pulumi";
import { Account as GcpServiceAccount } from "@pulumi/gcp/serviceaccount";

export interface AccountArgs {
    /**
     * The service account ID (the username part of the email, e.g. "my-service-account").
     */
    accountId: Input<string>;

    /**
     * The display name for the service account.
     */
    displayName: Input<string>;

    /**
     * Optional description of the service account's purpose.
     */
    description?: Input<string>;

    /**
     * Optional GCP Project ID.
     */
    project?: Input<string>;
}

/**
 * Account Component Resource
 * Provisions a reusable, parameterized Google Cloud Service Account.
 */
export class Account extends ComponentResource {
    public readonly account: GcpServiceAccount;

    constructor(name: string, args: AccountArgs, opts?: ComponentResourceOptions) {
        super("custom:components:Account", name, args, opts);

        // Provision the underlying GCP Service Account
        this.account = new GcpServiceAccount(name, {
            accountId: args.accountId,
            displayName: args.displayName,
            description: args.description,
            project: args.project,
        }, { parent: this });

        this.registerOutputs({
            account: this.account,
        });
    }
}
