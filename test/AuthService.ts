import { type CognitoUser } from '@aws-amplify/auth';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { Amplify, Auth } from 'aws-amplify';

const awsRegion = 'us-west-1';

Amplify.configure({
	Auth: {
		region: awsRegion,
		userPoolId: 'us-west-1_fzkQPHsaM',
		userPoolWebClientId: 'qsp0r5bhcsjrlp6iqborrlhuh',
		identityPoolId: 'us-west-1:be18aeef-53b3-4a78-b955-37aef35a6e73',
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
		const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-west-1_fzkQPHsaM`;

		const cognitoIdentity = new CognitoIdentityClient({
			credentials: fromCognitoIdentityPool({
				identityPoolId: 'us-west-1:be18aeef-53b3-4a78-b955-37aef35a6e73',
				logins: {
					[cognitoIdentityPool]: jwtToken,
				},
			}),
		});

		const credentials = await cognitoIdentity.config.credentials();
		return credentials;
	}
}
