import { Config, IConfig } from "../types/config";

export class PrdConfig implements IConfig {
  getConfig(): Config {
    return {
      Vpc: {
        Cidr: "10.20.0.0/16",
      },
    };
  }
}
