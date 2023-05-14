import { type CognitoUser } from '@aws-amplify/auth';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { Amplify, Auth } from 'aws-amplify';

const awsRegion = 'us-west-1';

Amplify.configure({
	Auth: {
		region: awsRegion,
		userPoolId: 'us-west-1_tskVgCgqG',
		userPoolWebClientId: '3a1i0tqei4mefe4nmug11gjk1s',
		identityPoolId: 'us-west-1:91022e97-3fbc-4fbd-9d35-16c97787ed1f',
		authenticationFlowType: 'USER_PASSWORD_AUTH',
	},
});

export class AuthService {
	public async login(userName: string, password: string) {
		const result = (await Auth.signIn(userName, password)) as CognitoUser;
		return result;
	}

	public async generateTemporaryCredentials(user: CognitoUser) {
		const jwtToken = user.getSignInUserSession().getIdToken().getJwtToken();
		const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-west-1_tskVgCgqG`;

		const cognitoIdentity = new CognitoIdentityClient({
			credentials: fromCognitoIdentityPool({
				identityPoolId: 'us-west-1:91022e97-3fbc-4fbd-9d35-16c97787ed1f',
				logins: {
					[cognitoIdentityPool]: jwtToken,
				},
			}),
		});

		const credentials = await cognitoIdentity.config.credentials();
		return credentials;
	}
}
