#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MapsAppStack } from '../lib/mapsApp-stack';
import { BackendAPIStack } from '../lib/backendApi-stack';
import { MapsAppLayersStack } from '../lib/mapsAppLayers-stack';
import { CategoriesAppStack } from 'lib/categoriesApp-stack';
import { CategoriesAppLayersStack } from 'lib/categoiesAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "",
  region: "us-east-1"
}

const tags = {
  const: "Back-end_PortalGeoeste",
  team: "PortalGeoeste-1"
}

const mapsAppLayersStack = new MapsAppLayersStack(app, "MapAppLayer", {
  tags: tags,
  env: env,
})

const mapsAppStack = new MapsAppStack(app, "MapsApp", {
  tags: tags,
  env: env,
})
mapsAppStack.addDependency(mapsAppLayersStack)

const categoriesAppLayersStack = new CategoriesAppLayersStack(app, "CategoriesAppLayer", {
  tags: tags,
  env: env,
})

const categoriesAppStack = new CategoriesAppStack(app, "CategoriesApp", {
  tags: tags,
  env: env,
})
categoriesAppStack.addDependency(categoriesAppLayersStack)

const backendApiStack = new BackendAPIStack(app, "BackendApi", {
  mapsFetchHandler: mapsAppStack.mapsFetchHandler,
  mapsAdminHandler: mapsAppStack.mapsAdminHandler,
  categoriesFetchHandler: categoriesAppStack.categoriesFetchHandler,
  categoriesAdminHandler: categoriesAppStack.categoriesAdminHandler,
  tags: tags,
  env: env,
})
backendApiStack.addDependency(mapsAppStack)