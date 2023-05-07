import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {InstanceClass, InstanceSize, InstanceType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Cluster} from "aws-cdk-lib/aws-ecs";

interface EcsClusterStackProps extends cdk.StackProps {
  vpc: Vpc
}

export class EcsClusterStack extends cdk.Stack {
  public readonly cluster: Cluster
  constructor(scope: Construct, id: string, props: EcsClusterStackProps) {
    super(scope, id, props)

    this.cluster = new Cluster(this, 'Cluster', {
      vpc: props.vpc
    });
  }
}