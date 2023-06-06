import { SNSEvent } from 'aws-lambda';
import axios from 'axios';

const webHookUrl =
	'https://discord.com/api/webhooks/1115708081372930179/wvAA_IEqU4GgtmkhQpsc5jePQSev_-ZKTa8yBbI5RzfxnZNN3HDyonvztLSAWyU7Y02h';

// Send http request to the webhook containing the data from the event
async function handler(event: SNSEvent, context) {
	for (const record of event.Records) {
		await axios.post(webHookUrl, {
			content: `Ernest, we have a problem: ${record.Sns.Message}`,
		});

		// await fetch(webHookUrl, {
		// 	method: 'POST',
		// 	body: JSON.stringify({
		// 		text: `Ernest, we have a problem: ${record.Sns.Message}`,
		// 	}),
		// });
	}
}

export { handler };
