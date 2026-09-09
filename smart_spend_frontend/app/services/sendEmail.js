import * as MailComposer from "expo-mail-composer";

export async function sendTransactionReport(recipient, attachmentUri, period) {
  const available = await MailComposer.isAvailableAsync();

  if (!available) {
    throw new Error("Email is not available on this device.");
  }

  await MailComposer.composeAsync({
    recipients: [recipient],

    subject: `Smart Spend Transaction Report - ${period}`,

    body: `Hello,

Please find attached your Smart Spend transaction report.

Regards,
Smart Spend Team`,

    attachments: [attachmentUri],
  });
}
