import * as cdk from 'aws-cdk-lib';
import {Duration, SecretValue, aws_ssm} from "aws-cdk-lib";
import {Construct} from 'constructs';
import {Vpc, SecurityGroup, Peer, Port} from 'aws-cdk-lib/aws-ec2';
import {FargateService} from "aws-cdk-lib/aws-ecs";
import {ApplicationLoadBalancer, ApplicationTargetGroup, ApplicationProtocol, ListenerAction} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface ApplicationLoadBalancerStackProps extends cdk.StackProps {
  vpc: Vpc,
  service: FargateService
}

export class ApplicationLoadBalancerStack extends cdk.Stack {
  public readonly lb: ApplicationLoadBalancer
  constructor(scope: Construct, id: string, props: ApplicationLoadBalancerStackProps) {
    super(scope, id, props)

    // LB
    this.lb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
    });

    // ターゲットグループ
    const targetGroup = new ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
      vpc: props.vpc,
      targetGroupName: 'ECSTargetGroup',
      protocol: ApplicationProtocol.HTTP,
      port: 80,
      targets: [
        props.service.loadBalancerTarget({containerName: 'app', containerPort: 80}),
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

    // リスナー
    const listener = this.lb.addListener('Listener443', {
      port: 443,
      certificates: [
        {
          certificateArn: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/acmArn'),
        }
      ],
      open: true,
      defaultTargetGroups: [targetGroup]
    });

    // oidc認証
    const clientId = SecretValue.secretsManager('FightMigration/oidc', {
      jsonField: 'clientId'
    });
    const clientSecret = SecretValue.secretsManager('FightMigration/oidc', {
      jsonField: 'clientSecret'
    });
    const oidcAction = ListenerAction.authenticateOidc({
      issuer: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/issuer'),
      authorizationEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/authorizationEndpoint'),
      tokenEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/tokenEndpoint'),
      userInfoEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/userInfoEndpoint'),
      clientId: clientId.unsafeUnwrap(),
      clientSecret,
      next: ListenerAction.forward([targetGroup]),
    });

    listener.addAction('OIDC', {
      action: oidcAction,
    });

    // auth0とのHTTPS通信許可（ingressは勝手に設定済み）
    const sgEgressAnywhere = new SecurityGroup(this, 'SgEgressAnywhere', {
      vpc: props.vpc
    })
    sgEgressAnywhere.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow HTTPS traffic to any destination');
    sgEgressAnywhere.addEgressRule(Peer.anyIpv6(), Port.tcp(443), 'Allow HTTPS traffic to any destination (IPv6)');

    this.lb.addSecurityGroup(sgEgressAnywhere)
  }
}