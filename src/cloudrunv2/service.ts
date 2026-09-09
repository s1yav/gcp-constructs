import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";
import { Service as GcpCloudRunService } from "@pulumi/gcp/cloudrunv2";
import type { input } from "@pulumi/gcp/types";

export interface ServiceArgs {
    /**
     * The name of the Cloud Run v2 service.
     */
    serviceName: Input<string>;

    /**
     * The GCP location/region for the service (e.g., "us-central1").
     */
    location: Input<string>;

    /**
     * Whether deletion protection is enabled on this Cloud Run service.
     * Defaults to false if omitted.
     */
    deletionProtection?: Input<boolean>;

    /**
     * Ingress setting for traffic. Options: INGRESS_TRAFFIC_ALL, INGRESS_TRAFFIC_INTERNAL_ONLY, INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER.
     * Defaults to "INGRESS_TRAFFIC_ALL".
     */
    ingress?: Input<string>;

    /**
     * Maximum number of container instances allowed to scale.
     * Defaults to 2.
     */
    maxInstanceCount?: Input<number>;

    /**
     * Container image location (e.g. "us-docker.pkg.dev/cloudrun/container/hello").
     */
    image: Input<string>;

    /**
     * CPU limit for the container (e.g. "1", "2"). Defaults to "2".
     */
    cpuLimit?: Input<string>;

    /**
     * Memory limit for the container (e.g. "512Mi", "1024Mi"). Defaults to "1024Mi".
     */
    memoryLimit?: Input<string>;

    /**
     * Environment variables to inject into the container.
     */
    envs?: Input<Input<input.cloudrunv2.ServiceTemplateContainerEnv>[]>;

    /**
     * Service account email to execute the container.
     */
    serviceAccount?: Input<string>;
}

/**
 * Service Component Resource (Cloud Run v2)
 * Provisions a Google Cloud Run v2 Service styled consistently with gitops component constructs.
 */
export class Service extends ComponentResource {
    public readonly service: GcpCloudRunService;
    public readonly uri: Output<string>;

    constructor(name: string, args: ServiceArgs, opts?: ComponentResourceOptions) {
        super("custom:components:CloudRunv2Service", name, args, opts);

        this.service = new GcpCloudRunService(name, {
            name: args.serviceName,
            location: args.location,
            deletionProtection: args.deletionProtection ?? false,
            ingress: args.ingress ?? "INGRESS_TRAFFIC_ALL",
            scaling: {
                maxInstanceCount: args.maxInstanceCount ?? 2,
            },
            template: {
                serviceAccount: args.serviceAccount,
                containers: [{
                    image: args.image,
                    resources: {
                        limits: {
                            cpu: args.cpuLimit ?? "2",
                            memory: args.memoryLimit ?? "1024Mi",
                        },
                    },
                    envs: args.envs,
                }],
            },
        }, { parent: this });

        this.uri = this.service.uri;

        this.registerOutputs({
            service: this.service,
            uri: this.uri,
        });
    }
}
