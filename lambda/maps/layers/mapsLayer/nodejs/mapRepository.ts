import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Map {

    // definicao dos atributos correspondente ao mapa
    id: string, // USAR UUID
    mapName: string,
    mapDescription: string,
    mapFonte: string,
    imageUrl?: string,
    shapefileUrl?: string,
    geojsonUrl?: JSON,
}

export class MapRepository {
    private ddbClient: DocumentClient
    private ddbTable: string

    constructor(ddbClient: DocumentClient, ddbTable: string) {
        this.ddbClient = ddbClient
        this.ddbTable = ddbTable
    }

    // criando os metodos de acesso à tabela
    async getAll(): Promise<Map[]> {
        const data = await this.ddbClient.scan({
            TableName: this.ddbTable
        }).promise()
        return data.Items as Map[]
    }

    async getById(itemId: string): Promise<Map> {
        const data = await this.ddbClient.get({
            TableName: this.ddbTable,
            Key: {
                id: itemId
            }
        }).promise()
        if (data.Item) {
            return data.Item as Map
        } else {
            throw new Error('Map not found')
        }
    }

    async create(itemToPersist: Map): Promise<Map> {
        itemToPersist.id = uuid()
        const data = await this.ddbClient.put({
            TableName: this.ddbTable,
            Item: itemToPersist
        }).promise()
        return itemToPersist
    }

    async exclude(itemId: string): Promise<Map> {
        const data = await this.ddbClient.delete({
            TableName: this.ddbTable,
            Key: {
                id: itemId
            },
            ReturnValues: "ALL_OLD"
        }).promise()
        if (data.Attributes) {
            return data.Attributes as Map
        } else {
            throw new Error('Map not found')
        }
    }

    async modify(itemId: string, itemToModify: Map): Promise<Map> {
        const data = await this.ddbClient.update({
            TableName: this.ddbTable,
            Key: {
                id: itemId
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: "UPDATED_NEW",
            UpdateExpression: "set mapName = :n, mapDescription = :d, mapFonte = :f, imageUrl = :i, shapefileUrl = :s, geojsonUrl = :g ",
            ExpressionAttributeValues: {
                ":n": itemToModify.mapName,
                ":d": itemToModify.mapDescription,
                ":f": itemToModify.mapFonte,
                ":i": itemToModify.imageUrl,
                ":s": itemToModify.shapefileUrl,
                ":g": itemToModify.geojsonUrl
            }
        }).promise()
        data.Attributes!.id = itemId
        return data.Attributes as Map
    }
}