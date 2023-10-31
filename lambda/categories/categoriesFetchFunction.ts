import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CategoryRepository } from "/opt/nodejs/categoriesLayer";
import { DynamoDB } from "aws-sdk"

const categoryDdbTable = process.env.MAPS_DDB!
const clientDdb = new DynamoDB.DocumentClient()
const categoryRepository = new CategoryRepository(clientDdb, categoryDdbTable)

export async function handler(
  event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId
  const method = event.httpMethod;

  // geração de log para testes, depois devemos excluir para nao
  // gerar processamento e pagamentos
  console.log(`API Request Id: ${apiRequestId} - Lambda Request Id: ${lambdaRequestId}`)
  // fim do log para remover

  if (event.resource === "/categories") {
    if (method === 'GET') {
      console.log('GET')

      const categories = await categoryRepository.getAll()

      return {
        statusCode: 200,
        body: JSON.stringify(categories)
      }
    }
  } else if (event.resource === "/categories/{id}") {
    const categoryId = event.pathParameters!.id as string
    
    try {
      const category = await categoryRepository.getById(categoryId)

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
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request"
    })
  }
}