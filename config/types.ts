const EnvType = {
  PRD: 'prd',
  DEV: 'dev',
} as const;
export type EnvType = typeof EnvType[keyof typeof EnvType];

export type Config = {
  vpc: {
    cidr: string
  },
  route53: {
    customDomain: string
  }
};

export interface IConfig {
  getConfig(): Config;
}
