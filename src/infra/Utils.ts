import { Fn, Stack } from 'aws-cdk-lib';

// Generate unique random suffix - for having the same suffix for different across stacks
export function getSuffixFromStack(stack: Stack) {
	const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
	const suffix = Fn.select(4, Fn.split('-', shortStackId));
	return suffix;
}
