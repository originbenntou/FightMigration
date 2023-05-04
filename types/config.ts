const EnvType = {
  PRD: 'prd',
  DEV: 'dev',
} as const;
export type EnvType = typeof EnvType[keyof typeof EnvType];

export type Config = {
  Vpc: {
    Cidr: string;
  };
};

export interface IConfig {
  getConfig(): Config;
}
