import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Repository} from "aws-cdk-lib/aws-ecr";

interface EcrRepositoryStackProps extends cdk.StackProps {
  repoName: string
}

export class EcrRepositoryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcrRepositoryStackProps) {
    super(scope, id, props);

    new Repository(this, 'Repository', {
      repositoryName: props.repoName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true
    });
  }
}
