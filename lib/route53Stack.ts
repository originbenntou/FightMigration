import * as cdk from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets'
import * as alb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {aws_ssm} from "aws-cdk-lib";


interface Route53StackProps extends cdk.StackProps {
  customDomain: string
  alb: alb.ApplicationLoadBalancer
}

export class Route53Stack extends cdk.Stack {
  public readonly route53ARecord
  constructor (scope: Construct, id: string, props: Route53StackProps) {
    super(scope, id, props)

    this.route53ARecord = new route53.ARecord(this, 'AliasRecord', {
      recordName: props.customDomain,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(props.alb)),
      zone: route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: aws_ssm.StringParameter.valueForStringParameter(this,'/FightMigration/hostedZoneId'),
        zoneName: props.customDomain
      })
    })
  }
}