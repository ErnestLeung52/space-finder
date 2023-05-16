## Initialize CDK project from scratch:

-   Project and dependencies set up
    npm init -y
    npm i -D aws-cdk aws-cdk-lib constructs
    npm i -D typescript ts-node
    npm i -D @types/node
    npm i -D @types/aws-lambda
    npm i -D esbuild
    npm i uuid @types/uuid
    npm i @aws-sdk/client-s3
    npm i @aws-sdk/client-dynamodb
    npm i aws-amplify
    npm i @aws-amplify/auth
    npm i @aws-sdk/client-cognito-identity
    npm i @aws-sdk/credential-providers
    npm init vite@latest -- --template react-ts
    npm i @aws-sdk/client-cognito-identity @aws-sdk/credential-providers
    npm i @aws-sdk/client-s3

-   create Launcher.ts file
    bin folder for the application

-   create cdk.json file
    instruct CDK to look at luancher

## Dependency management:

-   Deploy only dependencies, not dev-dependencies (TS, TS-node, CDK, etc...)
-   Do not deploy AWS SDK dependencies - included in the Lambda runtime
-   Bundling: the operation of taking a code from multiple files and generating one single file only with runnable code
-   Solution: NodejsFunction CDK construct
    -   Bundles all code with tree shaking
    -   Compiles TS to JS
    -   Leaves out AWS-SDK dependencies
    -   Completely editable
    -   Bundling solution: ESbuild

## AWS SDK

-   Access other AWS resources within account (CLI)
-   Setup debugger script for AWS Lambda (access granted due to CLI auth, can add session token if you have no administrative access)

## AWS Lambdaa architecture

-   API Gateway -> AWS Lambda -> DynamoDB
-   Basic App: API Gateway generates an endpoint, which can be invoked by Lambda and write into DynamoDB
-   Extending App: Multiple HTTP methods for endpoints
    1. Write a Lambda for each HTTP method
    2. One Lambda for a endpoint: group by API Gateway Resources (Recommended by AWS)
    3. Monolithic Lambda to handle all traffics
-   Multiple Lambdas advantages: deploy independently, self description(understand by others), easier to log/monitor

## Marshalling Solution

-   'S:' -> Marshalling (dynamoDB format)
-   marshal/unmarshal @aws-sdk/util-dynamodb
-   DynamoDBDocumentClient @aws-sdk/lib-dynamodb

## Bundle Optimization

-   Use Node.js internal uuid library to reduce bundle size

## AWS Cognito

-   User pools: store user data; basic authentication solution
-   Identity pools: fine grained access control; directly call AWS SDK commands
-   JWT token: a way in which APIs over the Internet can be secured
-   Cognito user group: a fine grained access control solution, for partial access restriction

## AWS Cognito Identity Pools

-   User sends credentials to Cognito and in return receives a session object that contains JWT token
-   The JWT token will be used to generate or assign to get a IAM role, a role that the user can assume
-   Retrieves a set of temporary credentials from AWS (access, secret access key, session ID, etc...)
-   Invoke SDK calls With temp credentials

## UI Development

-   Export CF ouput data to use in the app
    -   cdk deploy --all --outputs-file output.json
-   Deploy the app to S3 & CloudFront for fast feedback of deployment status
-   Set up backend for browser access (CORS)
-   Create UI, deployment bucket, BucketDeployment, originDeployment to read the bucket, CloudFrontDistribution(read data from S3 bucket)

## React with Amplify

-   If inner state of a component changes, React will re-render the component (dynamic behavior)
-   Configure Vite to distribute code compatiable with AWS S3
-   Upload dist to S3, and optimize dist size
-   Create spaces: ingest data (name, location, photo) send data to DynamoDB and create a bucket to upload the pic file to the bucket and return back the photo url
