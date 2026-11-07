
import {
  LambdaClient,
  InvokeCommand,
} from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

export async function sendPhoneVerificationSms({
  phone,
  code,
}) {
  const functionName =
    process.env.SMS_LAMBDA_FUNCTION_NAME;

  const sharedSecret =
    process.env.SMS_LAMBDA_SHARED_SECRET;

  if (!functionName) {
    throw new Error(
      "SMS_LAMBDA_FUNCTION_NAME is not configured"
    );
  }

  if (!sharedSecret) {
    throw new Error(
      "SMS_LAMBDA_SHARED_SECRET is not configured"
    );
  }

  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("Invalid E.164 phone number");
  }

  if (!/^\d{6}$/.test(String(code))) {
    throw new Error("Invalid verification code");
  }

  const event = {
    headers: {
      "x-community-one-secret": sharedSecret,
    },
    body: JSON.stringify({
      phone,
      code: String(code),
    }),
  };

  const result = await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(event)),
    })
  );

  if (result.FunctionError) {
    throw new Error(
      "SMS Lambda execution failed"
    );
  }

  const responseText = Buffer.from(
    result.Payload || []
  ).toString("utf8");

  let response;

  try {
    response = JSON.parse(responseText);
  } catch {
    throw new Error(
      "SMS Lambda returned an invalid response"
    );
  }

  const statusCode = Number(response.statusCode);

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(
      `SMS Lambda rejected the request (${statusCode})`
    );
  }

  let body = response.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  if (body?.success !== true) {
    throw new Error(
      "SMS Lambda did not confirm successful submission"
    );
  }

  return {
    success: true,
    messageId: body.messageId || null,
  };
}
