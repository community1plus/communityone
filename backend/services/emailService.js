
import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

const region =
  process.env.AWS_REGION || "ap-southeast-2";

const fromEmail =
  process.env.SES_FROM_EMAIL || "no-reply@comm-unity.one";

const ses = new SESv2Client({ region });

export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Recipient, subject and email content are required");
  }

  const command = new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          ...(text
            ? {
                Text: {
                  Data: text,
                  Charset: "UTF-8",
                },
              }
            : {}),
          ...(html
            ? {
                Html: {
                  Data: html,
                  Charset: "UTF-8",
                },
              }
            : {}),
        },
      },
    },
  });

  const result = await ses.send(command);

  return {
    messageId: result.MessageId,
  };
}
