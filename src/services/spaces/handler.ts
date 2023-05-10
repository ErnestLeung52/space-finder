import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { postSpaces } from './PostSpaces';
import { getSpaces } from './GetSpaces';
import { updateSpace } from './UpdateSpace';
import { deleteSpace } from './DeleteSpace';

// Context: an outside scope; something outside of the main handler implementation can remain and be reused on further calls -> first make the connection to the DB and reuse that connection
const ddbClient = new DynamoDBClient({});

// handler will be run many times
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
	let message: string;

	try {
		switch (event.httpMethod) {
			case 'GET':
				const getResponse = await getSpaces(event, ddbClient);
				console.log(getResponse);
				return getResponse;

			case 'POST':
				const postResponse = await postSpaces(event, ddbClient);
				return postResponse;

			case 'PUT':
				const putResponse = await updateSpace(event, ddbClient);
				console.log(putResponse);
				return putResponse;

			case 'DELETE':
				const deleteResponse = await deleteSpace(event, ddbClient);
				console.log(deleteResponse);
				return deleteResponse;

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
