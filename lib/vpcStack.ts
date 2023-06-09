import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Vpc, IpAddresses, SubnetType} from 'aws-cdk-lib/aws-ec2';

interface VpcStackProps extends cdk.StackProps {
  cidr: string
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: Vpc
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props)

    this.vpc = new Vpc(this, 'Vpc', {
      ipAddresses: IpAddresses.cidr(props.cidr),
      availabilityZones: ['ap-northeast-1a', 'ap-northeast-1c'],
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}