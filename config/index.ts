import { DevConfig } from './dev';
import { EnvType } from "../types/config";

export const getConfig = (env: EnvType) => {
  let config;

  switch (env) {
    case "dev":
      config = new DevConfig();
      break;
    default:
      throw new Error("Please specify like `cdk deploy -c env=dev``");
  }

  return config.getConfig();
};