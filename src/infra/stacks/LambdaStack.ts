import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface LambdaStackProps extends StackProps {
	spacesTable: ITable;
}

export class LambdaStack extends Stack {
	public readonly helloLambdaIntegration: LambdaIntegration;

	constructor(scope: Construct, id: string, props: LambdaStackProps) {
		super(scope, id, props);

		// NodejsFunction bundles better than LambdaFunction
		const helloLambda = new NodejsFunction(this, 'HelloLambda', {
			// specify the code that will be executed inside the lambda
			runtime: Runtime.NODEJS_18_X,
			handler: 'handler',
			// specify the code for path
			// entry: Code.fromAsset(join(__dirname, '..', '..', 'services')),
			entry: join(__dirname, '..', '..', 'services', 'hello.ts'),
			// communicate with dynamodb table
			environment: {
				TABLE_NAME: props.spacesTable.tableName,
			},
		});

		helloLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:ListAllMyBuckets', 's3:ListBucket'],
				resources: ['*'], // bad practice
			})
		);

		// Export lambda for referencing
		this.helloLambdaIntegration = new LambdaIntegration(helloLambda);
	}
}
