import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { MapRepository } from "/opt/nodejs/mapsLayer";
import { DynamoDB } from "aws-sdk"

const mapDdbTable = process.env.MAPS_DDB!
const clientDdb = new DynamoDB.DocumentClient()
const mapRepository = new MapRepository(clientDdb, mapDdbTable)

export async function handler(
  event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId
  const method = event.httpMethod;

  // geração de log para testes, depois devemos excluir para nao
  // gerar processamento e pagamentos
  console.log(`API Request Id: ${apiRequestId} - Lambda Request Id: ${lambdaRequestId}`)
  // fim do log para remover

  if (event.resource === "/maps") {
    if (method === 'GET') {
      console.log('GET')

      const maps = await mapRepository.getAll()

      return {
        statusCode: 200,
        body: JSON.stringify(maps)
      }
    }
  } else if (event.resource === "/maps/{id}") {
    const mapId = event.pathParameters!.id as string
    
    try {
      const map = await mapRepository.getById(mapId)

      return {
        statusCode: 200,
        body: JSON.stringify(map)
      }
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: ((<Error>error).message)
        })
      }
    }
    
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request"
    })
  }
}