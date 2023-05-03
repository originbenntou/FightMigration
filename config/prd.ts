export class PrdConfig implements IConfig {
  getConfig() {
    return {
      Vpc: {
        Cidr: "10.20.0.0/16",
      },
    };
  }
}
