#!/usr/bin/env node
import {getConfig} from "../config";
import * as cdk from 'aws-cdk-lib'
import {VpcStack} from '../lib/vpcStack';
import {EcsClusterStack} from "../lib/ecsClusterStack";
import {EcsTaskDefinitionStack} from "../lib/ecsTaskDefinitionStack";
import {EcsServiceStack} from "../lib/ecsServiceStack";
import {ApplicationLoadBalancerStack} from "../lib/applicationLoadBalancerStack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');
const env = app.node.tryGetContext('env');

const config = getConfig(env);

// network
const vpcStack = new VpcStack(app, productName + 'VpcStack', {
  cidr: config.Vpc.Cidr
})

// ecs
const ecsClusterStack = new EcsClusterStack(app, productName + 'EcsClusterStack', {
  vpc: vpcStack.vpc
})
const ecsTaskDefinitionStack = new EcsTaskDefinitionStack(app, productName + 'EcsTaskDefinitionStack', {})
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
    service: ecsServiceA.service
  }
);

new cdk.CfnOutput(
  applicationLoadBalancerStack,
  'LoadBalancerDNS',
  {
    value: applicationLoadBalancerStack.lb.loadBalancerDnsName
  }
);

app.synth();
