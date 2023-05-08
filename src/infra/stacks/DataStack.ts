import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Create Stack

export class DataStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
	}
}
