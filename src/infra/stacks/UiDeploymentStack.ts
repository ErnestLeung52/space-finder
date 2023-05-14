import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { existsSync } from 'fs';
import { join } from 'path';
import { getSuffixFromStack } from '../Utils';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

export class UiDeploymentStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const suffix = getSuffixFromStack(this);

		// Create here to prevent risk of having circular dependency if reference outside
		// Create bucket to store html file
		const deploymentBucket = new Bucket(this, 'UiDeploymentBucket', {
			bucketName: `space-finder-frontend-${suffix}`,
		});

		// UI needs to be store under dist folder, else error
		const uiDir = join(__dirname, '..', '..', '..', '..', 'space-finder-frontend', 'dist');

		if (!existsSync(uiDir)) {
			console.warn('UI dir not found: ' + uiDir);
			return;
		}

		new BucketDeployment(this, 'SpaceFinderDeployment', {
			destinationBucket: deploymentBucket,
			sources: [Source.asset(uiDir)],
		});

		const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
		// Give right to read from the bucket
		deploymentBucket.grantRead(originIdentity);
		// Create distribution: have rights to read from deployment bucket
		const distribution = new Distribution(this, 'SpaceFinderDistribution', {
			defaultRootObject: 'index.html',
			defaultBehavior: {
				origin: new S3Origin(deploymentBucket, {
					originAccessIdentity: originIdentity,
				}),
			},
		});

		// Output the URL of distribution
		new CfnOutput(this, 'SpaceFinderUrl', {
			value: distribution.distributionDomainName,
		});
	}
}

// import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
// import { CloudFrontWebDistribution } from 'aws-cdk-lib/aws-cloudfront';
// import { IBucket } from 'aws-cdk-lib/aws-s3';
// import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
// import { Construct } from 'constructs';
// import { existsSync } from 'fs';
// import { join } from 'path';

// interface UiDeploymentStackProps extends StackProps {
// 	deploymentBucket: IBucket;
// }

// export class UiDeploymentStack extends Stack {
// 	constructor(scope: Construct, id: string, props: UiDeploymentStackProps) {
// 		super(scope, id, props);

// 		const uiDir = join(__dirname, '..', '..', '..', '..', 'space-finder-frontend', 'dist');

// 		if (existsSync(uiDir)) {
// 			new BucketDeployment(this, 'space-finder-ui-deployment', {
// 				destinationBucket: props.deploymentBucket,
// 				sources: [Source.asset(uiDir)],
// 			});

// 			new CfnOutput(this, 'space-finder-ui-deploymentS3Url', {
// 				value: props.deploymentBucket.bucketWebsiteUrl,
// 			});
// 		} else {
// 			console.warn('Ui directory not found: ' + uiDir);
// 		}
// 	}
// }
