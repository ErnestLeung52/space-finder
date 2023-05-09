import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { postSpaces } from './PostSpaces';

// Context: an outside scope; something outside of the main handler implementation can remain and be reused on further calls -> first make the connection to the DB and reuse that connection
const ddbClient = new DynamoDBClient({});

// handler will be run many times
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
	let message: string;

	try {
		switch (event.httpMethod) {
			case 'GET':
				message = 'Hello from GET!';
				break;

			case 'POST':
				const response = postSpaces(event, ddbClient);
				return response;

			default:
				break;
		}
	} catch (error) {
		console.error(error);

		return {
			statusCode: 500,
			body: JSON.stringify(error.message),
		};
	}

	const response: APIGatewayProxyResult = {
		statusCode: 200,
		body: JSON.stringify(message),
	};

	return response;
}

export { handler };
