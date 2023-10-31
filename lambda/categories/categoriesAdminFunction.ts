import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Category, CategoryRepository } from "/opt/nodejs/categoriesLayer";
import { DynamoDB } from "aws-sdk"

const categoryDdbTable = process.env.MAPS_DDB!
const clientDdb = new DynamoDB.DocumentClient()
const categoryRepository = new CategoryRepository(clientDdb, categoryDdbTable)

export async function handler(
  event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  const method = event.httpMethod

  if (event.resource === "/categories") {
    const category = JSON.parse(event.body!) as Category
    const categoryCreated = await categoryRepository.create(category)

    return {
      statusCode: 201,
      body: JSON.stringify(categoryCreated)
    }

  } else if (event.resource === "/categories/{id}") {
    const categoryId = event.pathParameters!.id as string

    if (method === "PUT") {
      const category = JSON.parse(event.body!) as Category

      try {
        const categoryUpdated = await categoryRepository.modify(categoryId, category)

        return {
          statusCode: 200,
          body: JSON.stringify(categoryUpdated)
        }

      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Category not found"
          })
        }
      }

    } else if (method === "DELETE") {
      try {
        const category = await categoryRepository.exclude(categoryId)

        return {
          statusCode: 200,
          body: JSON.stringify(category)
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