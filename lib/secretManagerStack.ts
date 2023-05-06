import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {aws_secretsmanager} from "aws-cdk-lib";

interface SecretManagerStackProps extends cdk.StackProps {}

export class SecretManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SecretManagerStackProps) {
    super(scope, id, props);

    // 値は手動で管理
    new aws_secretsmanager.Secret(this, 'SecretManager', {});
  }
}
