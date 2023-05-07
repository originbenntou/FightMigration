#!/usr/bin/env node
import {getConfig} from "../config";
import * as cdk from 'aws-cdk-lib'
import {VpcStack} from '../lib/vpcStack';
import {EcsClusterStack} from "../lib/ecsClusterStack";
import {EcsTaskDefinitionStack} from "../lib/ecsTaskDefinitionStack";
import {EcsServiceStack} from "../lib/ecsServiceStack";
import {ApplicationLoadBalancerStack} from "../lib/applicationLoadBalancerStack";
import {VpcEndpointStack} from "../lib/vpcEndpointStack";
import {Route53Stack} from "../lib/route53Stack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');
const repoNameV1 = app.node.tryGetContext('repoNameV1');
const repoNameV2 = app.node.tryGetContext('repoNameV2');

const env = app.node.tryGetContext('env');

const config = getConfig(env);

const cidr = config.vpc.cidr;
const customDomain = config.route53.customDomain;

// network
const vpcStack = new VpcStack(app, productName + 'VpcStack', {
  cidr
})

// vpc endpoint
new VpcEndpointStack(app, productName + 'VpcEndpointStack', {
  vpc: vpcStack.vpc
})

// ecs cluster
const ecsClusterStack = new EcsClusterStack(app, productName + 'EcsClusterStack', {
  vpc: vpcStack.vpc
})

// ecs task v1
const ecsTaskDefinitionStackV1 = new EcsTaskDefinitionStack(app, productName + 'EcsTaskDefinitionStackV1', {
  repoName: repoNameV1,
})

// ecs service v1
const ecsServiceStackV1 = new EcsServiceStack(app, productName + 'EcsServiceStackV1', {
  repoName: repoNameV1,
  cluster: ecsClusterStack.cluster,
  taskDefinition: ecsTaskDefinitionStackV1.taskDefinition,
})

// ecs task v2
const ecsTaskDefinitionStackV2 = new EcsTaskDefinitionStack(app, productName + 'EcsTaskDefinitionStackV2', {
  repoName: repoNameV2,
})

// ecs service v2
const ecsServiceStackV2 = new EcsServiceStack(app, productName + 'EcsServiceStackV2', {
  repoName: repoNameV2,
  cluster: ecsClusterStack.cluster,
  taskDefinition: ecsTaskDefinitionStackV2.taskDefinition,
})

// alb
const applicationLoadBalancerStack = new ApplicationLoadBalancerStack(
  app,
  productName + 'ApplicationLoadBalancerStack',
  {
    vpc: vpcStack.vpc,
    serviceV1: ecsServiceStackV1.service,
    serviceV2: ecsServiceStackV2.service,
  }
);

// route53
const route53Stack = new Route53Stack(app, productName + 'Route53Stack', {
  customDomain: customDomain,
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
