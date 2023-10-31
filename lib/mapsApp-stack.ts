import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as ssm from "aws-cdk-lib/aws-ssm"

import { Construct } from "constructs";

export class MapsAppStack extends cdk.Stack {
  readonly mapsFetchHandler: lambdaNodeJS.NodejsFunction
  readonly mapsAdminHandler: lambdaNodeJS.NodejsFunction;

  readonly mapsDdb: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // criar tabela do dynamo para o maps
    this.mapsDdb = new dynamodb.Table(this, "MapsDdb", {
      tableName: "maps",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
    })

    // instanciando os layers dos maps
    const mapsLayerArn = ssm.StringParameter.valueForStringParameter(this, "MapsLayerVersionArn")
    const mapsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "MapsLayerVersionArn", mapsLayerArn)

    // funcao de acesso e captura dos dados gravados
    this.mapsFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "MapsFetchFunction",
      {
        // definicao do runtime do node 16
        runtime: lambda.Runtime.NODEJS_16_X,
        functionName: "MapsFetchFunction",
        entry: "lambda/maps/mapsFetchFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          MAPS_DDB: this.mapsDdb.tableName
        }, 
        layers: [mapsLayer]
      })
    this.mapsDdb.grantReadData(this.mapsFetchHandler)

    // funcao de inclusao e modificacao dos dados gravados
    this.mapsAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "MapsAdminFunction",
      {
        // definicao do runtime do node 16
        runtime: lambda.Runtime.NODEJS_16_X,
        functionName: "MapsAdminFunction",
        entry: "lambda/maps/mapsAdminFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          MAPS_DDB: this.mapsDdb.tableName
        },
        layers: [mapsLayer]
      })
    this.mapsDdb.grantWriteData(this.mapsAdminHandler)
  }
}