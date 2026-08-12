/** SMTP 协议单测：用内存假传输走完整对话，验证命令序列、认证、DATA 帧与错误路径 */
import { describe, expect, it } from 'vitest';
import { runSmtp, SmtpError, type SmtpConfig, type SmtpTransport } from '../src/smtp';

const CFG: SmtpConfig = {
  host: 'smtp.test',
  port: 465,
  user: 'you@test.com',
  pass: 'app-pass',
  from: 'you@test.com',
};

const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

/** 假 SMTP 服务端：greeting 为连接问候，其后按脚本 [匹配命令或谓词, 回复行序列] 应答 */
function fakeServer(
  greeting: string,
  script: Array<[string | ((l: string) => boolean), string[]]>,
): { t: SmtpTransport; commands: string[] } {
  const commands: string[] = [];
  const writeSteps = script.slice(0);
  let pending: string[] = [greeting];
  const t: SmtpTransport = {
    async write(line) {
      commands.push(line);
      const step = writeSteps.find(([m]) => (typeof m === 'function' ? m(line) : m === line));
      if (!step) throw new Error(`unexpected command: ${line}`);
      pending = [...step[1]];
    },
    async readLine() {
      const line = pending.shift();
      if (line === undefined) throw new Error('no reply queued');
      return line;
    },
    async close() {},
  };
  return { t, commands };
}

const OK = ['250 OK'];

describe('runSmtp', () => {
  it('完整对话：EHLO/AUTH/发信/QUIT 命令序列正确，含 RFC2047 主题与正文', async () => {
    const { t, commands } = fakeServer('220 smtp.test ESMTP', [
      ['EHLO zeji-lunar', ['250-smtp.test', '250-SIZE 10485760', '250 OK']],
      ['AUTH LOGIN', ['334 VXNlcm5hbWU6']],
      [b64('you@test.com'), ['334 UGFzc3dvcmQ6']],
      [b64('app-pass'), ['235 2.7.0 Authentication successful']],
      ['MAIL FROM:<you@test.com>', OK],
      ['RCPT TO:<friend@test.com>', OK],
      ['DATA', ['354 End data with <CR><LF>.<CR><LF>']],
      [(l) => l.startsWith('From: '), OK],
      ['QUIT', ['221 Bye']],
    ]);

    await runSmtp(t, CFG, { to: 'friend@test.com', subject: '八月十三 黄历早报 · 己未日', html: '<p>今日宜忌</p>' });

    expect(commands[0]).toBe('EHLO zeji-lunar');
    expect(commands[1]).toBe('AUTH LOGIN');
    expect(commands[2]).toBe(b64('you@test.com'));
    expect(commands[3]).toBe(b64('app-pass'));
    expect(commands[4]).toBe('MAIL FROM:<you@test.com>');
    expect(commands[5]).toBe('RCPT TO:<friend@test.com>');
    expect(commands[6]).toBe('DATA');

    const msg = commands[7];
    expect(msg).toContain('Subject: =?UTF-8?B?'); // 中文主题 RFC2047
    expect(msg).toContain('Content-Type: text/html');
    expect(msg).toContain('<p>今日宜忌</p>');
    expect(msg.endsWith('</p>\r\n.\r\n')).toBe(true);

    expect(commands[8]).toBe('QUIT');
  });

  it('点填充：正文行首 "." 转 ".."', async () => {
    const { t, commands } = fakeServer('220 ok', [
      ['EHLO zeji-lunar', OK],
      ['AUTH LOGIN', ['334 ']],
      [b64(CFG.user), ['334 ']],
      [b64(CFG.pass), ['235 ok']],
      ['MAIL FROM:<you@test.com>', OK],
      ['RCPT TO:<friend@test.com>', OK],
      ['DATA', ['354 go']],
      [(l) => l.startsWith('From: '), OK],
      ['QUIT', ['221 Bye']],
    ]);
    await runSmtp(t, CFG, { to: 'friend@test.com', subject: 's', text: '第一行\n.第二行\n第三行' });
    const msg = commands[7];
    expect(msg).toContain('\r\n..第二行\r\n');
  });

  it('认证失败抛出 SmtpError', async () => {
    const { t } = fakeServer('220 ok', [
      ['EHLO zeji-lunar', OK],
      ['AUTH LOGIN', ['334 ']],
      [b64(CFG.user), ['334 ']],
      [b64(CFG.pass), ['535 5.7.8 Authentication credentials invalid']],
    ]);
    await expect(runSmtp(t, CFG, { to: 'x@y.com', subject: 's', text: 't' })).rejects.toThrow(SmtpError);
  });
});
