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
const repoName = app.node.tryGetContext('repoName');

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

// ecs task
const ecsTaskDefinitionStack = new EcsTaskDefinitionStack(app, productName + 'EcsTaskDefinitionStack', {
  repoName,
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
  }
);

// route53
const route53Stack = new Route53Stack(app, productName + 'Route53Stack', {
  customDomain,
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
