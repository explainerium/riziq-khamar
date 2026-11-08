import "server-only";
import nodemailer from "nodemailer";
import { env } from "../config/env";

interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Sends through SMTP when it is configured; otherwise logs and does nothing. */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.SMTP_HOST) {
    console.info(`[mail] SMTP is not configured, skipped: ${mail.subject}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  await transport.sendMail({ from: env.MAIL_FROM ?? env.SMTP_USER, ...mail });
}
