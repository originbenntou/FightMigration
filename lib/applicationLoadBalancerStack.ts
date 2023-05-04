import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Vpc} from 'aws-cdk-lib/aws-ec2';
import {ApplicationLoadBalancer} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {Ec2Service} from "aws-cdk-lib/aws-ecs";

interface ApplicationLoadBalancerStackProps extends cdk.StackProps {
  vpc: Vpc,
  service: Ec2Service
}

export class ApplicationLoadBalancerStack extends cdk.Stack {
  public readonly lb: ApplicationLoadBalancer
  constructor(scope: Construct, id: string, props: ApplicationLoadBalancerStackProps) {
    super(scope, id, props)

    this.lb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
    });

    const listener = this.lb.addListener('PublicListener', {
      port: 8080,
      open: true,
    })

    listener.addTargets('Ecs', {
      port: 8080,
      targets: [props.service.loadBalancerTarget({
        containerName: 'web',
        containerPort: 80
      })],
      // include health check (default is none)
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: "/health",
        timeout: cdk.Duration.seconds(5),
      }
    })
  }
}