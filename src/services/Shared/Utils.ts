import { v4 } from 'uuid';
import { JsonError } from './Validators';
import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function createRandomId() {
	// return v4();
	return randomUUID();
}

export function parseJSON(arg: string) {
	try {
		return JSON.parse(arg);
	} catch (error) {
		throw new JsonError(error.message);
	}
}

export function hasAdminGroup(event: APIGatewayProxyEvent): Boolean {
	const groups = event.requestContext.authorizer?.claims['cognito:groups'];

	if (groups) {
		return (groups as string).includes('admins');
	}

	return false;
}
