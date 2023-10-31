import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as ssm from "aws-cdk-lib/aws-ssm"

import { Construct } from "constructs";

export class CategoriesAppStack extends cdk.Stack {
  readonly categoriesFetchHandler: lambdaNodeJS.NodejsFunction
  readonly categoriesAdminHandler: lambdaNodeJS.NodejsFunction;

  readonly categoriesDdb: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // criar tabela do dynamo para o categories
    this.categoriesDdb = new dynamodb.Table(this, "CategoriesDdb", {
      tableName: "categories",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })

    // instanciando os layers dos categories
    const categoriesLayerArn = ssm.StringParameter.valueForStringParameter(this, "CategoriesLayerVersionArn")
    const categoriesLayer = lambda.LayerVersion.fromLayerVersionArn(this, "CategoriesLayerVersionArn", categoriesLayerArn)

    // funcao de acesso e captura dos dados gravados
    this.categoriesFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "CategoriesFetchFunction",
      {
        // definicao do runtime do node 16
        runtime: lambda.Runtime.NODEJS_16_X,
        functionName: "CategoriesFetchFunction",
        entry: "lambda/categories/categoriesFetchFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          CATEGORIES_DDB: this.categoriesDdb.tableName
        }, 
        layers: [categoriesLayer]
      })
    this.categoriesDdb.grantReadData(this.categoriesFetchHandler)

    // funcao de inclusao e modificacao dos dados gravados
    this.categoriesAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "CategoriesAdminFunction",
      {
        // definicao do runtime do node 16
        runtime: lambda.Runtime.NODEJS_16_X,
        functionName: "CategoriesAdminFunction",
        entry: "lambda/categories/categoriesAdminFunction.ts",
        handler: "handler",
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        bundling: {
          minify: true,
          sourceMap: false
        },
        environment: {
          CATEGORIES_DDB: this.categoriesDdb.tableName
        },
        layers: [categoriesLayer]
      })
    this.categoriesDdb.grantWriteData(this.categoriesAdminHandler)
  }
}