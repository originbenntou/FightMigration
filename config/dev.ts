export class DevConfig implements IConfig {
  getConfig() {
    return {
      Vpc: {
        Cidr: "10.10.0.0/16",
      },
    };
  }
}
