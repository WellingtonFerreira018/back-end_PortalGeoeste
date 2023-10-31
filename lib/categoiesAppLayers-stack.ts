import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs";

export class CategoriesAppLayersStack extends cdk.Stack {
    readonly categoriesLayers: lambda.LayerVersion

    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props)

        this.categoriesLayers = new lambda.LayerVersion(this, "CategoriesLayer", {
            code: lambda.Code.fromAsset('lambda/categories/layers/categoriesLayer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            layerVersionName: "CategoriesLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })

        new ssm.StringParameter(this, "CategoriesLayerVersionArn", {
            parameterName: "CategoriesLayerVersionArn",
            stringValue: this.categoriesLayers.layerVersionArn
        })
    }
}