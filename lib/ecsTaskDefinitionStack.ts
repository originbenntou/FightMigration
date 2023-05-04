import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {TaskDefinition, ContainerDefinition, ContainerImage, Protocol, Compatibility} from "aws-cdk-lib/aws-ecs";

interface EcsTaskDefinitionStackProps extends cdk.StackProps {}

export class EcsTaskDefinitionStack extends cdk.Stack {
  public readonly taskDefinition: TaskDefinition
  public readonly container: ContainerDefinition
  constructor(scope: Construct, id: string, props: EcsTaskDefinitionStackProps) {
    super(scope, id, props)

    this.taskDefinition = new TaskDefinition(this, 'TaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });
    this.container = this.taskDefinition.addContainer('web', {
      image: ContainerImage.fromRegistry('public.ecr.aws/ecs-sample-image/amazon-ecs-sample:latest'),
    });

    // this.container.addPortMappings({
    //   containerPort: 80,
    //   hostPort: 8080,
    //   protocol: Protocol.TCP
    // })
  }
}