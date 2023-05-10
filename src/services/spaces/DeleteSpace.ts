import {
	DeleteItemCommand,
	DynamoDBClient,
	GetItemCommand,
	PutItemCommand,
	ScanCommand,
	UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { hasAdminGroup } from '../Shared/Utils';

export async function deleteSpace(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	const isAuthorized = hasAdminGroup(event);

	if (!isAuthorized) {
		return {
			statusCode: 401,
			body: JSON.stringify('Not authorized!!!'),
		};
	}

	// Retrieve specific ID
	const params = event.queryStringParameters;

	if (params && 'id' in params) {
		const spaceId = params['id'];

		await ddbClient.send(
			new DeleteItemCommand({
				TableName: process.env.TABLE_NAME,
				Key: {
					id: { S: spaceId },
				},
			})
		);

		return {
			statusCode: 200,
			body: JSON.stringify(`Delete space with id ${spaceId}`),
		};
	}

	return {
		statusCode: 400,
		body: JSON.stringify('Please provide right args!'),
	};
}
