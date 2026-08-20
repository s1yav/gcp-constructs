import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export interface ServiceArgs {
    /**
     * The project ID.
     */
    projectId: pulumi.Input<string>;

    /**
     * The service name to enable (e.g. "compute.googleapis.com").
     */
    serviceName: pulumi.Input<string>;

    /**
     * Whether to disable the service when the resource is destroyed. Defaults to false.
     */
    disableOnDestroy?: pulumi.Input<boolean>;
}

/**
 * Service Component Resource (Projects API Enablement)
 * Enables a GCP API service for a project.
 */
export class Service extends pulumi.ComponentResource {
    public readonly service: gcp.projects.Service;

    constructor(name: string, args: ServiceArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:Service", name, args, opts);

        this.service = new gcp.projects.Service(name, {
            project: args.projectId,
            service: args.serviceName,
            disableOnDestroy: args.disableOnDestroy ?? false,
        }, { parent: this });

        this.registerOutputs({
            service: this.service,
        });
    }
}
