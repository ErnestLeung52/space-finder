import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { validateAsSpaceEntry } from '../Shared/Validators';
import { createRandomId, parseJSON } from '../Shared/Utils';

export async function postSpaces(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	const randomId = createRandomId();

	// event.body contains the data requesting from the client
	// const item = JSON.parse(event.body);

	// Custom parse function, if error out, throw custom error instead of internal server error
	const item = parseJSON(event.body);

	item.id = randomId;

	validateAsSpaceEntry(item);

	const result = await ddbClient.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,

			Item: marshall(item),
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
