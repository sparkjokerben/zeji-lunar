/** Resend 邮件发送：失败重试 1 次，仍失败抛错（由 cron 记录 lastFail） */
import type { Env } from '../env';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface EmailOptions {
  subject: string;
  html: string;
}

export async function sendEmail(env: Env, opts: EmailOptions): Promise<void> {
  const body = {
    from: `择吉黄历 <daily@${env.SEND_DOMAIN}>`,
    to: [env.TO_EMAIL],
    subject: opts.subject,
    html: opts.html,
  };

  const doSend = (): Promise<Response> =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

  let res = await doSend();
  if (!res.ok) {
    await sleep(1000);
    res = await doSend();
  }
  if (!res.ok) {
    throw new Error(`resend failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
}
