import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Ec2TaskDefinition, ContainerDefinition, ContainerImage, Protocol} from "aws-cdk-lib/aws-ecs";

interface EcsTaskDefinitionStackProps extends cdk.StackProps {}

export class EcsTaskDefinitionStack extends cdk.Stack {
  public readonly taskDefinition: Ec2TaskDefinition
  public readonly container: ContainerDefinition
  constructor(scope: Construct, id: string, props: EcsTaskDefinitionStackProps) {
    super(scope, id, props)

    this.taskDefinition = new Ec2TaskDefinition(this, 'TaskDefinition');
    this.container = this.taskDefinition.addContainer('web', {
      image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      memoryLimitMiB: 256,
    });

    this.container.addPortMappings({
      containerPort: 80,
      hostPort: 8080,
      protocol: Protocol.TCP
    })
  }
}