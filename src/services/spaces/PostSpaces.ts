import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { v4 } from 'uuid';

export async function postSpaces(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	const randomId = v4();

	// event.body contains the data requesting from the client
	const item = JSON.parse(event.body);
	item.id = randomId;

	const result = await ddbClient.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,
			Item: {
				id: { S: randomId },
				location: {
					S: item.location,
				},
			}, // SDK V3
		})
	);

	console.log(result);

	return {
		statusCode: 201,
		body: JSON.stringify({ id: randomId }),
	};
}
