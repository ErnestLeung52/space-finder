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
	public readonly spacesLambdaIntegration: LambdaIntegration;

	constructor(scope: Construct, id: string, props: LambdaStackProps) {
		super(scope, id, props);

		// NodejsFunction bundles better than LambdaFunction
		const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
			// specify the code that will be executed inside the lambda
			runtime: Runtime.NODEJS_18_X,
			handler: 'handler',
			// specify the code for path
			// entry: Code.fromAsset(join(__dirname, '..', '..', 'services')),
			// entry: join(__dirname, '..', '..', 'services', 'hello.ts'),
			entry: join(__dirname, '..', '..', 'services', 'spaces', 'handler.ts'),
			// communicate with dynamodb table
			environment: {
				TABLE_NAME: props.spacesTable.tableName,
			},
		});

		/* Add policy for accessing S3 Bucket list
		helloLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:ListAllMyBuckets', 's3:ListBucket'],
				resources: ['*'], // bad practice
			})
		);
		*/

		// Export lambda for referencing
		this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda);
	}
}
