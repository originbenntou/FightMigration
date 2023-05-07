#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import {EcrRepositoryStack} from "../lib/ecrRepositoryStack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');

// ecr repositories
new EcrRepositoryStack(app, productName + 'EcrRepositoryV1Stack', {
  repoName: 'fight-migration-v1'
});
new EcrRepositoryStack(app, productName + 'EcrRepositoryV2Stack', {
  repoName: 'fight-migration-v2'
});

app.synth();
