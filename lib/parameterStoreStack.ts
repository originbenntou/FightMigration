import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';

interface ParameterStoreStackProps extends cdk.StackProps {}

export class ParameterStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ParameterStoreStackProps) {
    super(scope, id, props);

    // 値は手動で管理

  }
}
