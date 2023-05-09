// import { handler } from '../src/services/hello';

// handler({} as any, {} as any);

import { handler } from '../src/services/spaces/handler';

// Executing from Node.js
// ts-node [relative path]
process.env.AWS_REGION = 'us-west-1';
process.env.TABLE_NAME = 'SpaceTable-02ed2914a20b';

// Testing Post method for DynamoDB in Debugger
handler(
	{
		httpMethod: 'POST',
		body: JSON.stringify({
			location: 'Dublin',
		}),
	} as any,
	{} as any
);
