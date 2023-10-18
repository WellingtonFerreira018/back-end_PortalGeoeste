#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "",
  region: "us-east-1"
}

const tags = {
  const: "Back-end_PortalGeoeste",
  team: "PortalGeoeste-1"
}