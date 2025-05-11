// src/lib/send-email.ts
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail({ to, subject, text }: { to: string, subject: string, text: string }) {
  await sgMail.send({ to, from: 'no-reply@yourapp.com', subject, text })
}
