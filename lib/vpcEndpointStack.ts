import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Vpc, InterfaceVpcEndpointAwsService, GatewayVpcEndpointAwsService} from 'aws-cdk-lib/aws-ec2';

interface VpcEndpointStackProps extends cdk.StackProps {
  vpc: Vpc
}

export class VpcEndpointStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VpcEndpointStackProps) {
    super(scope, id, props);

    props.vpc.addInterfaceEndpoint("ecr-endpoint", {
      service: InterfaceVpcEndpointAwsService.ECR
    });
    props.vpc.addInterfaceEndpoint("ecr-dkr-endpoint", {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER
    });
    props.vpc.addInterfaceEndpoint("logs-endpoint", {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
    });
    props.vpc.addGatewayEndpoint("s3-endpoint", {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: [
        {
          subnets: props.vpc.isolatedSubnets
        },
      ],
    });
  }
}