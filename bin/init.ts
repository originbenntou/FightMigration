#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import {EcrRepositoryStack} from "../lib/ecrRepositoryStack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');

// ecr repository
new EcrRepositoryStack(app, productName + 'EcrRepositoryStack', {
  repoName: 'fight-migration'
});

app.synth();
