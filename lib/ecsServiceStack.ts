import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Cluster, TaskDefinition, FargateService} from "aws-cdk-lib/aws-ecs";

interface EcsServiceStackProps extends cdk.StackProps {
  cluster: Cluster,
  taskDefinition: TaskDefinition,
}

export class EcsServiceStack extends cdk.Stack {
  public readonly service: FargateService
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)

    this.service = new FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
    });
  }
}