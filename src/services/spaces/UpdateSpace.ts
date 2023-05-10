import {
	DynamoDBClient,
	GetItemCommand,
	PutItemCommand,
	ScanCommand,
	UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function updateSpace(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	// Retrieve specific ID

	const params = event.queryStringParameters;

	if (params && 'id' in params && event.body) {
		const parsedBody = JSON.parse(event.body);
		const spaceId = params['id'];
		const requestBodyKey = Object.keys(parsedBody)[0];
		const requestBodyValue = parsedBody[requestBodyKey];

		const updateResult = await ddbClient.send(
			new UpdateItemCommand({
				TableName: process.env.TABLE_NAME,
				Key: {
					id: { S: spaceId },
				},
				// prevent dynamoDB reserved key conflicts
				UpdateExpression: 'set #zzzNew = :new',
				ExpressionAttributeValues: {
					':new': {
						S: requestBodyValue,
					},
				},
				// Replace the value of this key
				ExpressionAttributeNames: {
					'#zzzNew': requestBodyKey,
				},
				ReturnValues: 'UPDATED_NEW',
			})
		);

		return {
			statusCode: 204,
			body: JSON.stringify(updateResult.Attributes),
		};
	}

	return {
		statusCode: 400,
		body: JSON.stringify('Please provide right args!'),
	};
}
