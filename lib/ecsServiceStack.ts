import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Cluster, TaskDefinition, Ec2Service} from "aws-cdk-lib/aws-ecs";

interface EcsServiceStackProps extends cdk.StackProps {
  cluster: Cluster,
  taskDefinition: TaskDefinition,
}

export class EcsServiceStack extends cdk.Stack {
  public readonly service: Ec2Service
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)

    this.service = new Ec2Service(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: props.taskDefinition,
    });
  }
}