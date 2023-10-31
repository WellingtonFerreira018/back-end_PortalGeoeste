import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Map, MapRepository } from "/opt/nodejs/mapsLayer";
import { DynamoDB } from "aws-sdk"

const mapDdbTable = process.env.MAPS_DDB!
const clientDdb = new DynamoDB.DocumentClient()
const mapRepository = new MapRepository(clientDdb, mapDdbTable)

export async function handler(
  event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  const method = event.httpMethod

  if (event.resource === "/maps") {
    const map = JSON.parse(event.body!) as Map
    const mapCreated = await mapRepository.create(map)

    return {
      statusCode: 201,
      body: JSON.stringify(mapCreated)
    }

  } else if (event.resource === "/maps/{id}") {
    const mapId = event.pathParameters!.id as string

    if (method === "PUT") {
      const map = JSON.parse(event.body!) as Map

      try {
        const mapUpdated = await mapRepository.modify(mapId, map)

        return {
          statusCode: 200,
          body: JSON.stringify(mapUpdated)
        }

      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Map not found"
          })
        }
      }

    } else if (method === "DELETE") {
      try {
        const map = await mapRepository.exclude(mapId)

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
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request"
    })
  }
}