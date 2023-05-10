import { v4 } from 'uuid';
import { JsonError } from './Validators';
import { randomUUID } from 'crypto';

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
