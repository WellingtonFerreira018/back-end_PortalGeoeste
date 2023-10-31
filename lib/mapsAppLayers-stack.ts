import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs";

export class MapsAppLayersStack extends cdk.Stack {
    readonly mapsLayers: lambda.LayerVersion

    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id, props)

        this.mapsLayers = new lambda.LayerVersion(this, "MapsLayer", {
            code: lambda.Code.fromAsset('lambda/maps/layers/mapsLayer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
            layerVersionName: "MapsLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })

        new ssm.StringParameter(this, "MapsLayerVersionArn", {
            parameterName: "MapsLayerVersionArn",
            stringValue: this.mapsLayers.layerVersionArn
        })
    }
}