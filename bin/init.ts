#!/usr/bin/env node
import {getConfig} from "../config";
import * as cdk from 'aws-cdk-lib'
import {EcrRepositoryStack} from "../lib/ecrRepositoryStack";

const app = new cdk.App();

const productName = app.node.tryGetContext('productName');
const env = app.node.tryGetContext('env');

const config = getConfig(env);

// ecr repository
const ecrRepositoryStack = new EcrRepositoryStack(app, productName + 'EcrRepositoryStack', {
  repoName: 'fight-migration'
});

app.synth();
