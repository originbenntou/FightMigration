import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Cluster, TaskDefinition, FargateService, LaunchType} from "aws-cdk-lib/aws-ecs";

interface EcsServiceStackProps extends cdk.StackProps {
  repoName: string
  cluster: Cluster,
  taskDefinition: TaskDefinition,
}

export class EcsServiceStack extends cdk.Stack {
  public readonly service: FargateService
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)

    this.service = new FargateService(this, props.repoName + 'Service', {
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
      capacityProviderStrategies: [
        {
          capacityProvider: "FARGATE",
          base: 0,
          weight: 0,
        },
        {
          capacityProvider: "FARGATE_SPOT",
          base: 1,
          weight: 1,
        },
      ],
      desiredCount: 1,
    });
  }
}