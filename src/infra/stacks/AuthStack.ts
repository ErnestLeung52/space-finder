import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
	CfnIdentityPool,
	CfnIdentityPoolRoleAttachment,
	CfnUserPoolGroup,
	UserPool,
	UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface AuthStackProps extends StackProps {
	photosBucket: IBucket;
}

export class AuthStack extends Stack {
	// private userPool: UserPool;

	// public: need reference to this userPool inside our API to create a security layer.
	public userPool: UserPool;
	private userPoolClient: UserPoolClient;
	private identityPool: CfnIdentityPool;

	private authenticatedRole: Role;
	private unAuthenticatedRole: Role;
	private adminRole: Role;

	constructor(scope: Construct, id: string, props: AuthStackProps) {
		super(scope, id, props);

		this.createUserPool();
		this.createUserPoolClient();
		this.createIdentityPool();

		this.createRoles(props.photosBucket);
		this.attachRoles();
		// placed at last because need something from createRoles()
		this.createAdminsGroup();
	}

	private createUserPool() {
		this.userPool = new UserPool(this, 'SpaceUserPool', {
			selfSignUpEnabled: true,
			signInAliases: {
				username: true,
				email: true,
			},
		});

		// need userPoolId when connecting the userPool
		new CfnOutput(this, 'SpaceUserPoolId', {
			value: this.userPool.userPoolId,
		});
	}

	private createUserPoolClient() {
		this.userPoolClient = this.userPool.addClient('SpaceUserPoolClient', {
			authFlows: {
				adminUserPassword: true,
				custom: true,
				userPassword: true,
				userSrp: true,
			},
		});
		new CfnOutput(this, 'SpaceUserPoolClientId', {
			value: this.userPoolClient.userPoolClientId,
		});
	}

	private createAdminsGroup() {
		new CfnUserPoolGroup(this, 'SpaceAdmins', {
			userPoolId: this.userPool.userPoolId,
			groupName: 'admins',
			roleArn: this.adminRole.roleArn,
		});
	}

	private createIdentityPool() {
		this.identityPool = new CfnIdentityPool(this, 'SpaceIdentityPool', {
			allowUnauthenticatedIdentities: true,
			cognitoIdentityProviders: [
				{
					clientId: this.userPoolClient.userPoolClientId,
					providerName: this.userPool.userPoolProviderName,
				},
			],
		});

		new CfnOutput(this, 'SpaceIdentityPoolId', {
			// Access Identity Pool Id for referencing outside of the stack
			value: this.identityPool.ref,
		});
	}

	// Specify below roles are assumed by the identity pool
	private createRoles(photosBucket: IBucket) {
		this.authenticatedRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
			// IAM Roles Trust relationship; assumed by identity pool
			assumedBy: new FederatedPrincipal(
				'cognito-identity.amazonaws.com',
				{
					StringEquals: {
						// the identify pool id
						'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
					},
					'ForAnyValue:StringLike': {
						'cognito-identity.amazonaws.com:amr': 'authenticated',
					},
				},
				'sts:AssumeRoleWithWebIdentity'
			),
		});

		this.unAuthenticatedRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
			assumedBy: new FederatedPrincipal(
				'cognito-identity.amazonaws.com',
				{
					StringEquals: {
						'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
					},
					'ForAnyValue:StringLike': {
						'cognito-identity.amazonaws.com:amr': 'unauthenticated',
					},
				},
				'sts:AssumeRoleWithWebIdentity'
			),
		});

		this.adminRole = new Role(this, 'CognitoAdminRole', {
			assumedBy: new FederatedPrincipal(
				'cognito-identity.amazonaws.com',
				{
					StringEquals: {
						'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
					},
					'ForAnyValue:StringLike': {
						'cognito-identity.amazonaws.com:amr': 'authenticated',
					},
				},
				'sts:AssumeRoleWithWebIdentity'
			),
		});

		// Testing: added actions to role for listing all buckets
		// Admin role is able to do blow actions to only inside the bucket
		this.adminRole.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['s3:*', 's3-object-lambda:*'],
				resources: [photosBucket.bucketArn + '/*'],
			})
		);
	}

	// Special construct to attach roles to the identity pool
	private attachRoles() {
		new CfnIdentityPoolRoleAttachment(this, 'RolesAttachment', {
			identityPoolId: this.identityPool.ref,
			roles: {
				authenticated: this.authenticatedRole.roleArn,
				unauthenticated: this.unAuthenticatedRole.roleArn,
			},
			roleMappings: {
				adminsMapping: {
					type: 'Token',
					ambiguousRoleResolution: 'AuthenticatedRole',
					identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
				},
			},
		});
	}
}
