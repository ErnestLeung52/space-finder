import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function getSpaces(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	// Retrieve specific ID
	if (event.queryStringParameters) {
		if ('id' in event.queryStringParameters) {
			const spaceId = event.queryStringParameters['id'];

			const getItemResponse = await ddbClient.send(
				new GetItemCommand({
					TableName: process.env.TABLE_NAME,
					Key: {
						id: { S: spaceId },
					},
				})
			);

			if (getItemResponse.Item) {
				//
				const unmarshalledItem = unmarshall(getItemResponse.Item);

				return {
					statusCode: 200,
					body: JSON.stringify(unmarshalledItem),
				};
			} else {
				return {
					statusCode: 404,
					body: JSON.stringify(`Space with id ${spaceId} not found!`),
				};
			}
		} else {
			return {
				statusCode: 401,
				body: JSON.stringify('Id required!'),
			};
		}
	}

	// Scan Operation
	const result = await ddbClient.send(
		new ScanCommand({
			TableName: process.env.TABLE_NAME,
		})
	);

	// Unmarshal to handle array
	const unmarshalledItems = result.Items?.map((item) => unmarshall(item));

	console.log(unmarshalledItems);

	return {
		statusCode: 201,
		body: JSON.stringify(unmarshalledItems),
	};
}
