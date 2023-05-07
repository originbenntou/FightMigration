import * as cdk from 'aws-cdk-lib';
import {Duration, SecretValue, aws_ssm} from "aws-cdk-lib";
import {Construct} from 'constructs';
import {Vpc, SecurityGroup, Peer, Port} from 'aws-cdk-lib/aws-ec2';
import {FargateService} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
  ApplicationProtocol,
  ListenerAction,
  ApplicationListenerRule, ListenerCondition
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface ApplicationLoadBalancerStackProps extends cdk.StackProps {
  vpc: Vpc,
  serviceV1: FargateService,
  serviceV2: FargateService,
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

    // ターゲットグループ v1
    const targetGroupV1 = new ApplicationTargetGroup(this, 'ApplicationTargetGroupV1', {
      vpc: props.vpc,
      targetGroupName: 'ECSTargetGroupV1',
      protocol: ApplicationProtocol.HTTP,
      port: 80,
      targets: [
        props.serviceV1.loadBalancerTarget({containerName: 'app', containerPort: 80}),
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
    // ターゲットグループ v2
    const targetGroupV2 = new ApplicationTargetGroup(this, 'ApplicationTargetGroupV2', {
      vpc: props.vpc,
      targetGroupName: 'ECSTargetGroupV2',
      protocol: ApplicationProtocol.HTTP,
      port: 80,
      targets: [
        props.serviceV2.loadBalancerTarget({containerName: 'app', containerPort: 80}),
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
      defaultTargetGroups: [targetGroupV1]
    });

    // oidc認証 v1
    const clientId = SecretValue.secretsManager('FightMigration/oidc', {
      jsonField: 'clientId'
    });
    const clientSecret = SecretValue.secretsManager('FightMigration/oidc', {
      jsonField: 'clientSecret'
    });
    const oidcActionV1 = ListenerAction.authenticateOidc({
      issuer: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/issuer'),
      authorizationEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/authorizationEndpoint'),
      tokenEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/tokenEndpoint'),
      userInfoEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/userInfoEndpoint'),
      clientId: clientId.unsafeUnwrap(),
      clientSecret,
      next: ListenerAction.forward([targetGroupV1]),
    });
    listener.addAction('OIDC', {
      action: oidcActionV1,
    });

    // auth0とのHTTPS通信許可（ingressは勝手に設定済み）
    const sgEgressAnywhere = new SecurityGroup(this, 'SgEgressAnywhere', {
      vpc: props.vpc
    })
    sgEgressAnywhere.addEgressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow HTTPS traffic to any destination');
    sgEgressAnywhere.addEgressRule(Peer.anyIpv6(), Port.tcp(443), 'Allow HTTPS traffic to any destination (IPv6)');
    this.lb.addSecurityGroup(sgEgressAnywhere)

    // coffeeパスはv2へルーティング
    const coffeePathRule = new ApplicationListenerRule(this, 'PathRule', {
      listener: listener,
      conditions: [ListenerCondition.pathPatterns(['/coffee'])],
      // action: ListenerAction.forward([targetGroupV2]),
      priority: 100,
    });

    // oidc認証 v2
    const oidcActionV2 = ListenerAction.authenticateOidc({
      issuer: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/issuer'),
      authorizationEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/authorizationEndpoint'),
      tokenEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/tokenEndpoint'),
      userInfoEndpoint: aws_ssm.StringParameter.valueForStringParameter(this, '/FightMigration/oidc/userInfoEndpoint'),
      clientId: clientId.unsafeUnwrap(),
      clientSecret,
      next: ListenerAction.forward([targetGroupV2]),
    });
    coffeePathRule.configureAction(oidcActionV2);
  }
}