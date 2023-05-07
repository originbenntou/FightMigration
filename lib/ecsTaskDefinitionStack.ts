import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Repository} from "aws-cdk-lib/aws-ecr";
import {
  TaskDefinition,
  ContainerDefinition,
  ContainerImage,
  Compatibility,
  Protocol,
  AwsLogDriver
} from "aws-cdk-lib/aws-ecs";
import * as logs from 'aws-cdk-lib/aws-logs';

interface EcsTaskDefinitionStackProps extends cdk.StackProps {
  repoName: string
}

export class EcsTaskDefinitionStack extends cdk.Stack {
  public readonly taskDefinition: TaskDefinition
  public readonly container: ContainerDefinition
  constructor(scope: Construct, id: string, props: EcsTaskDefinitionStackProps) {
    super(scope, id, props)

    // task
    this.taskDefinition = new TaskDefinition(this, 'TaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    // container
    const repository = Repository.fromRepositoryName(this, 'repo', props.repoName);
    this.container = this.taskDefinition.addContainer('app', {
      image: ContainerImage.fromEcrRepository(repository),
      logging: new AwsLogDriver({
        streamPrefix: `${props.repoName}`,
        logGroup: new logs.LogGroup(this, 'LogGroup', {
          logGroupName: `/aws/ecs/${props.repoName}-log-group`,
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY
        })
      }),
    });

    this.container.addPortMappings({
      containerPort: 80,
      hostPort: 80,
      protocol: Protocol.TCP
    });
  }
}