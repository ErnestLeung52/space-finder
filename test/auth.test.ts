import { AuthService } from './AuthService';

async function testAuth() {
	const service = new AuthService();
	const loginResult = await service.login('ernestleung52', 'Hennest14.');

	// In order to access secure API, need idToken

	console.log(loginResult.getSignInUserSession().getIdToken().getJwtToken());
}

testAuth();
