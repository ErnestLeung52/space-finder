## Initialize CDK project from scratch:

- Project and dependencies set up
  npm init -y
  npm i -D aws-cdk aws-cdk-lib constructs
  npm i -D typescript ts-node
  npm i -D @types/node
  npm i -D @types/aws-lambda
  npm i -D esbuild
  npm i uuid @types/uuid
  npm i @aws-sdk/client-s3

- create Launcher.ts file
  bin folder for the application

- create cdk.json file
  instruct CDK to look at luancher


## Dependency management:
- Deploy only dependencies, not dev-dependencies (TS, TS-node, CDK, etc...)
- Do not deploy AWS SDK dependencies - included in the Lambda runtime
- Bundling: the operation of taking a code from multiple files and generating one single file only with runnable code
- Solution: NodejsFunction CDK construct
  - Bundles all code with tree shaking
  - Compiles TS to JS
  - Leaves out AWS-SDK dependencies
  - Completely editable
  - Bundling solution: ESbuild

## AWS SDK
- Access other AWS resources within account (CLI)
- Setup debugger script for AWS Lambda (access granted due to CLI auth, can add session token if you have no administrative access)