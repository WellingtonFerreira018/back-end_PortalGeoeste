import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface BackendAPIStackProps extends cdk.StackProps {
    mapsFetchHandler: lambdaNodeJS.NodejsFunction
    mapsAdminHandler: lambdaNodeJS.NodejsFunction
    categoriesFetchHandler: lambdaNodeJS.NodejsFunction
    categoriesAdminHandler: lambdaNodeJS.NodejsFunction
}

export class BackendAPIStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: BackendAPIStackProps) {
        super(scope, id, props)

        // geração de log para testes, depois devemos excluir
        
        const logGroup = new cwlogs.LogGroup(this, "BackendAPILogs")
        // fim do log para remover

        const api = new apigateway.RestApi(this, "BackendAPI", {
            restApiName: "BackendAPI",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true
                })
            }
        })

        // criando a integracao da funcao de busca
        const mapsFetchIntegration = new apigateway.LambdaIntegration(props.mapsFetchHandler)
        const categoriesFetchHandler = new apigateway.LambdaIntegration(props.categoriesFetchHandler)

        // mapeando o get para todos os itens em "/maps"
        const mapsResource = api.root.addResource("maps")
        mapsResource.addMethod("GET", mapsFetchIntegration)

        const categoriesResource = api.root.addResource("categories")
        categoriesResource.addMethod("GET", categoriesFetchHandler)

        // adicionando o recurso para busca por 'id'
        const mapIdResource = mapsResource.addResource("{id}")
        mapIdResource.addMethod("GET", mapsFetchIntegration)

        const categoryIdResource = categoriesResource.addResource("{id}")
        categoryIdResource.addMethod("GET", categoriesFetchHandler)

        // criando o recurso de integração para as funcoes de modificacao
        const mapsAdminIntegration = new apigateway.LambdaIntegration(props.mapsAdminHandler)

        const categoriesAdminIntegration = new apigateway.LambdaIntegration(props.categoriesAdminHandler)

        // mapeando o post
        mapsResource.addMethod("POST", mapsAdminIntegration)
        categoriesResource.addMethod("POST", categoriesAdminIntegration)

        // mapeando o put
        mapsResource.addMethod("PUT", mapsAdminIntegration)

        // mapeando o delete
        mapIdResource.addMethod("DELETE", mapsAdminIntegration)
        categoryIdResource.addMethod("DELETE", categoriesAdminIntegration)

    }
}