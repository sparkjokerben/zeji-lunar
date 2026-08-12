/**
 * 极简 SMTP 客户端：465 隐式 TLS + AUTH LOGIN，走 cloudflare:sockets 出站 TCP。
 *
 * 依据：Cloudflare Workers 出站 TCP（connect()）仅禁止 25 端口，465/587 可用，
 * 见 https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/
 * 支持任意 SMTP 服务商（QQ/163/企业邮箱等，用授权码认证），无需第三方 API。
 *
 * 传输做抽象（cfTransport / 测试假传输），runSmtp 为纯协议逻辑，可在 Node 单测。
 */

export class SmtpError extends Error {}

export interface SmtpConfig {
  host: string;
  /** 仅支持 465（隐式 TLS） */
  port: number;
  user: string;
  pass: string;
  /** 发件人邮箱 */
  from: string;
}

export interface SmtpOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/** 抽象传输：真实实现走 cloudflare:sockets；测试用内存假传输 */
export interface SmtpTransport {
  write(line: string): Promise<void>;
  readLine(): Promise<string>;
  close(): Promise<void>;
}

const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

/** RFC 2047 编码含非 ASCII 的头字段（Subject/From 中文） */
const encodeHeader = (s: string) => (/[^\x20-\x7E]/.test(s) ? `=?UTF-8?B?${b64(s)}?=` : s);

/** SMTP 对话：EHLO → AUTH LOGIN → MAIL FROM → RCPT TO → DATA → QUIT */
export async function runSmtp(t: SmtpTransport, cfg: SmtpConfig, opts: SmtpOptions): Promise<void> {
  // 期望服务端回复指定代码（处理多行续行，如 EHLO 的 "250-…250 …"）
  const expect = async (code: string, ctx: string) => {
    let line = await t.readLine();
    while (line.length >= 4 && line[3] === '-') line = await t.readLine();
    if (!line.startsWith(code)) throw new SmtpError(`smtp: ${ctx} 失败: ${line}`);
    return line;
  };

  await expect('220', '连接问候');
  await t.write('EHLO zeji-lunar');
  await expect('250', 'EHLO');
  await t.write('AUTH LOGIN');
  await expect('334', 'AUTH 用户名');
  await t.write(b64(cfg.user));
  await expect('334', 'AUTH 密码');
  await t.write(b64(cfg.pass));
  await expect('235', 'AUTH 认证');
  await t.write(`MAIL FROM:<${cfg.from}>`);
  await expect('250', 'MAIL FROM');
  await t.write(`RCPT TO:<${opts.to}>`);
  await expect('250', 'RCPT TO');
  await t.write('DATA');
  await expect('354', 'DATA');

  const contentType = opts.html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
  const body = (opts.html ?? opts.text ?? '')
    .replace(/\r?\n/g, '\r\n') // DATA 统一 CRLF
    .replace(/^\./gm, '..'); // 点填充：行首 "." 转 ".."
  const message = [
    `From: ${encodeHeader('择吉黄历')} <${cfg.from}>`,
    `To: <${opts.to}>`,
    `Subject: ${encodeHeader(opts.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: ${contentType}`,
    '',
    body,
  ].join('\r\n');

  await t.write(message + '\r\n.\r\n');
  await expect('250', '邮件内容');

  await t.write('QUIT');
}

/** cloudflare:sockets 真实传输（465 隐式 TLS）。动态 import 使模块可在 Node 单测加载 */
async function cfTransport(cfg: SmtpConfig): Promise<SmtpTransport> {
  if (cfg.port !== 465) throw new SmtpError('smtp: 仅支持 465（隐式 TLS）端口');
  const { connect } = await import('cloudflare:sockets');
  const socket = connect({ hostname: cfg.host, port: cfg.port }, { secureTransport: 'on', allowHalfOpen: true });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  return {
    async write(line) {
      await writer.write(new TextEncoder().encode(line + '\r\n'));
    },
    async readLine() {
      while (!buf.includes('\n')) {
        const { value, done } = await reader.read();
        if (done) throw new SmtpError('smtp: 连接被服务端关闭');
        buf += decoder.decode(value, { stream: true });
      }
      const i = buf.indexOf('\n');
      const line = buf.slice(0, i).replace(/\r$/, '');
      buf = buf.slice(i + 1);
      return line;
    },
    async close() {
      try {
        await writer.close();
        reader.releaseLock();
      } catch {
        /* ignore */
      }
    },
  };
}

/** 发送邮件（失败抛出 SmtpError） */
export async function sendSmtpEmail(cfg: SmtpConfig, opts: SmtpOptions): Promise<void> {
  const t = await cfTransport(cfg);
  try {
    await runSmtp(t, cfg, opts);
  } finally {
    await t.close();
  }
}
