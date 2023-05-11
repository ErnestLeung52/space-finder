import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { postSpaces } from './PostSpaces';
import { getSpaces } from './GetSpaces';
import { updateSpace } from './UpdateSpace';
import { deleteSpace } from './DeleteSpace';
import { JsonError, MissingFieldError } from '../Shared/Validators';
import { addCorsHeader } from '../Shared/Utils';

// Context: an outside scope; something outside of the main handler implementation can remain and be reused on further calls -> first make the connection to the DB and reuse that connection
const ddbClient = new DynamoDBClient({});

// handler will be run many times
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
	// let message: string;
	let response: APIGatewayProxyResult;

	try {
		switch (event.httpMethod) {
			case 'GET':
				const getResponse = await getSpaces(event, ddbClient);
				// console.log(getResponse);
				response = getResponse;
				break;

			case 'POST':
				const postResponse = await postSpaces(event, ddbClient);
				response = postResponse;
				break;

			case 'PUT':
				const putResponse = await updateSpace(event, ddbClient);
				// console.log(putResponse);
				response = putResponse;
				break;

			case 'DELETE':
				const deleteResponse = await deleteSpace(event, ddbClient);
				// console.log(deleteResponse);
				response = deleteResponse;
				break;

			default:
				break;
		}
	} catch (error) {
		// console.error gives too much unnecessary error message
		// console.error(error);

		if (error instanceof MissingFieldError) {
			return {
				statusCode: 400,
				body: JSON.stringify(error.message),
			};
		}

		if (error instanceof JsonError) {
			return {
				statusCode: 400,
				body: JSON.stringify(error.message),
			};
		}

		return {
			// 500 unexpected error
			statusCode: 500,
			body: JSON.stringify(error.message),
		};
	}

	// const response: APIGatewayProxyResult = {
	// 	statusCode: 200,
	// 	body: JSON.stringify(message),
	// };

	// Add CORS header when we send back to client
	addCorsHeader(response);

	return response;
}

export { handler };
