import * as cdk from 'aws-cdk-lib';
import {Duration} from "aws-cdk-lib";
import {Construct} from 'constructs';
import {Vpc} from 'aws-cdk-lib/aws-ec2';
import {ApplicationLoadBalancer, ApplicationTargetGroup, ApplicationProtocol} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {FargateService} from "aws-cdk-lib/aws-ecs";

interface ApplicationLoadBalancerStackProps extends cdk.StackProps {
  vpc: Vpc,
  service: FargateService
  acm: string
}

export class ApplicationLoadBalancerStack extends cdk.Stack {
  public readonly lb: ApplicationLoadBalancer
  constructor(scope: Construct, id: string, props: ApplicationLoadBalancerStackProps) {
    super(scope, id, props)

    this.lb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
    });

    const targetGroup = new ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
      vpc: props.vpc,
      targetGroupName: 'ECSTargetGroup',
      protocol: ApplicationProtocol.HTTP,
      port: 80,
      targets: [
        props.service.loadBalancerTarget({containerName: 'web', containerPort: 80}),
      ],
      healthCheck: {
        interval: cdk.Duration.seconds(30),
        path: "/",
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
      deregistrationDelay: Duration.seconds(0)
    })

    this.lb.addListener('Listener80', {
      port: 80,
      open: true,
      defaultTargetGroups: [targetGroup]
    })
    this.lb.addListener('Listener443', {
      port: 443,
      certificates: [
        {
          certificateArn: props.acm,
        }
      ],
      open: true,
      defaultTargetGroups: [targetGroup]
    })

  }
}