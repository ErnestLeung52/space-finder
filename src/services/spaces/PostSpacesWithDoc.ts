import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { v4 } from 'uuid';

export async function postSpacesWithDoc(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	// Handle marshalling
	const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

	const randomId = v4();

	// event.body contains the data requesting from the client
	const item = JSON.parse(event.body);
	item.id = randomId;

	const result = await ddbDocClient.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,

			Item: item,
			// 'S:' -> Marshalling (dynamoDB format)
			// Item: {
			// 	id: { S: randomId },
			// 	location: {
			// 		S: item.location,
			// 	},
			// }, // SDK V3
		})
	);

	console.log(result);

	return {
		statusCode: 201,
		body: JSON.stringify({ id: randomId }),
	};
}
