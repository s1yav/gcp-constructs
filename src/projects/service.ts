import { ComponentResource, ComponentResourceOptions, Input } from "@pulumi/pulumi";
import { Service as GcpProjectService } from "@pulumi/gcp/projects";

export interface ServiceArgs {
    /**
     * The project ID.
     */
    projectId: Input<string>;

    /**
     * The service name to enable (e.g. "compute.googleapis.com").
     */
    serviceName: Input<string>;

    /**
     * Whether to disable the service when the resource is destroyed. Defaults to false.
     */
    disableOnDestroy?: Input<boolean>;
}

/**
 * Service Component Resource (Projects API Enablement)
 * Enables a GCP API service for a project.
 */
export class Service extends ComponentResource {
    public readonly service: GcpProjectService;

    constructor(name: string, args: ServiceArgs, opts?: ComponentResourceOptions) {
        super("custom:components:Service", name, args, opts);

        this.service = new GcpProjectService(name, {
            project: args.projectId,
            service: args.serviceName,
            disableOnDestroy: args.disableOnDestroy ?? false,
        }, { parent: this });

        this.registerOutputs({
            service: this.service,
        });
    }
}
