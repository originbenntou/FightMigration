import { Config, IConfig } from "../types/config";

export class DevConfig implements IConfig {
  getConfig(): Config {
    return {
      Vpc: {
        Cidr: "10.10.0.0/16",
      },
    };
  }
}
