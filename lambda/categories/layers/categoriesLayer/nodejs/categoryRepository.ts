import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Category {

  // definicao dos atributos correspondente à uma categoria
  id: string,
  categoryName: string,
  subcategories: [
    {
      subcategoryName: string,
      maps: [
        {
          id: string,
          mapName: string
        }
      ]
    }
  ]
}

export class CategoryRepository {
  private ddbClient: DocumentClient
  private ddbTable: string

  constructor(ddbClient: DocumentClient, ddbTable: string) {
    this.ddbClient = ddbClient
    this.ddbTable = ddbTable
  }

  // criando os metodos de acesso à tabela
  async getAll(): Promise<Category[]> {
    const data = await this.ddbClient.scan({
      TableName: this.ddbTable
    }).promise()
    return data.Items as Category[]
  }

  async getById(itemId: string): Promise<Category> {
    const data = await this.ddbClient.get({
      TableName: this.ddbTable,
      Key: {
        id: itemId
      }
    }).promise()
    if (data.Item) {
      return data.Item as Category
    } else {
      throw new Error('Category not found')
    }
  }

  async create(itemToPersist: Category): Promise<Category> {
    itemToPersist.id = uuid()
    const data = await this.ddbClient.put({
      TableName: this.ddbTable,
      Item: itemToPersist
    }).promise()
    return itemToPersist
  }

  async exclude(itemId: string): Promise<Category> {
    const data = await this.ddbClient.delete({
      TableName: this.ddbTable,
      Key: {
        id: itemId
      },
      ReturnValues: "ALL_OLD"
    }).promise()
    if (data.Attributes) {
      return data.Attributes as Category
    } else {
      throw new Error('Category not found')
    }
  }

  // acredito que nao devemos implementar uma função de edição de category
  // ou devemos verificar como alterar os itens dentro da categoria (subcategoria)
  // async modify(itemId: string, itemToModify: Category): Promise<Category> {
  //   const data = await this.ddbClient.update({
  //     TableName: this.ddbTable,
  //     Key: {
  //       id: itemId
  //     },
  //     ConditionExpression: 'attribute_exists(id)',
  //     ReturnValues: "UPDATED_NEW",
  //     UpdateExpression: "set categoryName = :n, ",
  //     ExpressionAttributeValues: {
  //       ":n": itemToModify.mapName,
  //       ":d": itemToModify.mapDescription,
  //       ":f": itemToModify.mapFonte,
  //       ":i": itemToModify.imageUrl,
  //       ":s": itemToModify.shapefileUrl,
  //       ":g": itemToModify.geojsonUrl
  //     }
  //   }).promise()
  //   data.Attributes!.id = itemId
  //   return data.Attributes as Category
  // }
}