import { Stack, StackProps } from 'aws-cdk-lib';
import {
	Code,
	Function as LambdaFunction,
	Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';

export class LambdaStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		new LambdaFunction(this, 'HelloLambda', {
			// specify the code that will be executed inside the lambda
			runtime: Runtime.NODEJS_18_X,
			handler: 'hello.main',
			// specify the code for path
			code: Code.fromAsset(join(__dirname, '..', '..', 'services')),
		});
	}
}
