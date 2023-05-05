import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Repository} from "aws-cdk-lib/aws-ecr";
import {TaskDefinition, ContainerDefinition, ContainerImage, Compatibility, Protocol} from "aws-cdk-lib/aws-ecs";

interface EcsTaskDefinitionStackProps extends cdk.StackProps {
  repoName: string
}

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

    const repository = Repository.fromRepositoryName(this, 'repo', props.repoName);
    this.container = this.taskDefinition.addContainer('web', {
      image: ContainerImage.fromEcrRepository(repository),
    });

    this.container.addPortMappings({
      containerPort: 80,
      hostPort: 80,
      protocol: Protocol.TCP
    })
  }
}