import { DevConfig } from './dev';
import { PrdConfig } from './prd';

const EnvType = {
  DEV: 'dev',
  PRD: 'prd',
} as const;
type EnvType = typeof EnvType[keyof typeof EnvType];

export const getConfig = (env: EnvType): Config => {
  let config;

  switch (env) {
    case "dev":
      config = new DevConfig();
      break;
    case "prd":
      config = new PrdConfig();
      break;
    default:
      throw new Error("Please specify like `cdk deploy -c env=dev``");
  }

  return config.getConfig();
};