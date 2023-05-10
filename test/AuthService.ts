import { type CognitoUser } from '@aws-amplify/auth';
import { Amplify, Auth } from 'aws-amplify';

const awsRegion = 'us-west-1';

Amplify.configure({
	Auth: {
		region: awsRegion,
		userPoolId: 'us-west-1_CYOuQU78H',
		userPoolWebClientId: '20nrv1n70vlgvo22slmlvsc0af',
		authenticationFlowType: 'USER_PASSWORD_AUTH',
	},
});

export class AuthService {
	public async login(userName: string, password: string) {
		const result = (await Auth.signIn(userName, password)) as CognitoUser;
		return result;
	}
}
