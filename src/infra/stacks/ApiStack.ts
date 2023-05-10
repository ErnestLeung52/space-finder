import { Stack, StackProps } from 'aws-cdk-lib';
import {
	AuthorizationType,
	CognitoUserPoolsAuthorizer,
	LambdaIntegration,
	MethodOptions,
	RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
	spacesLambdaIntegration: LambdaIntegration;
	userPool: IUserPool;
}

export class ApiStack extends Stack {
	constructor(scope: Construct, id: string, props: ApiStackProps) {
		super(scope, id, props);

		const api = new RestApi(this, 'SpacesApi');

		// Addeding a layer of authorization on top of API
		const authorizer = new CognitoUserPoolsAuthorizer(this, 'SpacesApiAuthorizer', {
			cognitoUserPools: [props.userPool],
			// pass the path to authorization header
			identitySource: 'method.request.header.Authorization',
		});

		authorizer._attachToApi(api);

		const optionsWithAuth: MethodOptions = {
			authorizationType: AuthorizationType.COGNITO,
			authorizer: {
				authorizerId: authorizer.authorizerId,
			},
		};

		// Manually adding resource here (path)
		const spacesResource = api.root.addResource('spaces');

		spacesResource.addMethod('GET', props.spacesLambdaIntegration, optionsWithAuth);
		spacesResource.addMethod('POST', props.spacesLambdaIntegration, optionsWithAuth);
		spacesResource.addMethod('PUT', props.spacesLambdaIntegration, optionsWithAuth);
		spacesResource.addMethod('DELETE', props.spacesLambdaIntegration, optionsWithAuth);
	}
}
