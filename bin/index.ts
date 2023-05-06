#!/usr/bin/env node
import {getConfig} from "../config";
import * as cdk from 'aws-cdk-lib'
import {EcrRepositoryStack} from "../lib/ecrRepositoryStack";
import {VpcStack} from '../lib/vpcStack';
import {EcsClusterStack} from "../lib/ecsClusterStack";
import {EcsTaskDefinitionStack} from "../lib/ecsTaskDefinitionStack";
import {EcsServiceStack} from "../lib/ecsServiceStack";
import {ApplicationLoadBalancerStack} from "../lib/applicationLoadBalancerStack";
import {VpcEndpointStack} from "../lib/vpcEndpointStack";
import {Route53Stack} from "../lib/route53Stack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');
const env = app.node.tryGetContext('env');

const acmArn = app.node.tryGetContext('acmArn');
const customDomain = app.node.tryGetContext('customDomain');
const hostedZoneId = app.node.tryGetContext('hostedZoneId');

const config = getConfig(env);

// network
const vpcStack = new VpcStack(app, productName + 'VpcStack', {
  cidr: config.Vpc.Cidr
})

// vpc endpoint
new VpcEndpointStack(app, productName + 'VpcEndpointStack', {
  vpc: vpcStack.vpc
})

// ecs cluster
const ecsClusterStack = new EcsClusterStack(app, productName + 'EcsClusterStack', {
  vpc: vpcStack.vpc
})

// ecs task
const ecsTaskDefinitionStack = new EcsTaskDefinitionStack(app, productName + 'EcsTaskDefinitionStack', {
  repoName: "fight-migration",
})

// ecs service
const ecsServiceA = new EcsServiceStack(app, productName + 'EcsServiceStackA', {
  cluster: ecsClusterStack.cluster,
  taskDefinition: ecsTaskDefinitionStack.taskDefinition,
})

// alb
const applicationLoadBalancerStack = new ApplicationLoadBalancerStack(
  app,
  productName + 'ApplicationLoadBalancerStack',
  {
    vpc: vpcStack.vpc,
    service: ecsServiceA.service,
    acm: acmArn,
  }
);

// route53
const route53Stack = new Route53Stack(app, productName + 'Route53Stack', {
  customDomain,
  hostedZoneId,
  alb: applicationLoadBalancerStack.lb
})

new cdk.CfnOutput(
  route53Stack,
  'DNS',
  {
    value: route53Stack.route53ARecord.domainName
  }
);

app.synth();
