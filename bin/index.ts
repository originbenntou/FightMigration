#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { getConfig } from "../config";
import { VpcStack } from '../lib/vpcStack';

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');
const env = app.node.tryGetContext('env');

const config = getConfig(env);

const vpcStack = new VpcStack(app, productName + 'VpcStack', {
  cidr: config.Vpc.Cidr
})

// const cluster = new ecs.Cluster(stack, 'EcsCluster', { vpc });
// cluster.addCapacity('DefaultAutoScalingGroup', {
//   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
// });
//
// const taskDefinition = new ecs.Ec2TaskDefinition(stack, 'TaskDef');
// const container = taskDefinition.addContainer('web', {
//   image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
//   memoryLimitMiB: 256,
// });
//
// container.addPortMappings({
//   containerPort: 80,
//   hostPort: 8080,
//   protocol: ecs.Protocol.TCP
// });
//
// const service = new ecs.Ec2Service(stack, "Service", {
//   cluster,
//   taskDefinition,
// });

// const lb = new elbv2.ApplicationLoadBalancer(stack, 'LB', {
//   vpc,
//   internetFacing: true
// });
// const listener = lb.addListener('PublicListener', { port: 80, open: true });
//
// listener.addTargets('ECS', {
//   port: 8080,
//   targets: [service.loadBalancerTarget({
//     containerName: 'web',
//     containerPort: 80
//   })],
//   healthCheck: {
//     interval: cdk.Duration.seconds(60),
//     path: "/health",
//     timeout: cdk.Duration.seconds(5),
//   }
// });
// new cdk.CfnOutput(stack, 'LoadBalancerDNS', { value: lb.loadBalancerDnsName, });

app.synth();
