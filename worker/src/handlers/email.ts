/** 邮件发送：SMTP（465 隐式 TLS，AUTH LOGIN）→ 失败重试 1 次，仍失败抛错（由 cron 记录 lastFail） */
import { sendSmtpEmail, type SmtpConfig } from '../smtp';
import type { Env } from '../env';

export interface EmailOptions {
  subject: string;
  text?: string;
  html?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cfg(env: Env): SmtpConfig {
  return {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  };
}

export async function sendEmail(env: Env, opts: EmailOptions): Promise<void> {
  const c = cfg(env);
  const doSend = () => sendSmtpEmail(c, { to: env.TO_EMAIL, subject: opts.subject, text: opts.text, html: opts.html });
  try {
    await doSend();
  } catch (e) {
    await sleep(1000);
    await doSend(); // 第二次仍失败则抛出 → cron 记录 lastFail
  }
}
