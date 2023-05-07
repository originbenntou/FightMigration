import { Config, IConfig } from "./types";

export class DevConfig implements IConfig {
  getConfig(): Config {
    return {
      vpc: {
        cidr: "10.10.0.0/16",
      },
      route53: {
        customDomainV1: "fmv1-dev.mototsuka.com",
        customDomainV2: "fmv2-dev.mototsuka.com"
      },
    };
  }
}
