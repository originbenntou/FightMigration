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
    customDomainV1: string
    customDomainV2: string
  }
};

export interface IConfig {
  getConfig(): Config;
}
