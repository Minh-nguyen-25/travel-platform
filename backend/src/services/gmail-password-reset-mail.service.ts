import nodemailer from 'nodemailer';
import env from '../config/env';
import { escapeHtml } from './mail.service';

export interface ResetCodeMail {
  to: string;
  code: string;
  expiresMinutes: number;
  recipientName: string;
}

type GmailSettings = Pick<typeof env, 'PASSWORD_RESET_MAIL_PROVIDER' | 'GMAIL_USER' | 'GMAIL_APP_PASSWORD' |
  'GMAIL_OAUTH_CLIENT_ID' | 'GMAIL_OAUTH_CLIENT_SECRET' | 'GMAIL_OAUTH_REFRESH_TOKEN'>;

export function renderResetCodeMail(params: ResetCodeMail): { html: string; text: string } {
  const text = [
    `Xin chào ${params.recipientName},`,
    'Mã xác nhận đặt lại mật khẩu TravelGo của bạn:', params.code,
    `Mã có hiệu lực ${params.expiresMinutes} phút và chỉ được sử dụng một lần.`,
    'Không chia sẻ mã này với bất kỳ ai. TravelGo không bao giờ yêu cầu bạn cung cấp mã qua điện thoại hoặc tin nhắn.',
    'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại chưa bị thay đổi.',
  ].join('\n\n');
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><body style="margin:0;background:#f0f5f3;font:15px/1.7 Arial,sans-serif;color:#16483e"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:32px"><p style="font-weight:bold;color:#087f8c">TravelGo · Hành trình Việt</p><h1 style="font-size:24px">Xác nhận đặt lại mật khẩu</h1><p>Xin chào ${escapeHtml(params.recipientName)},</p><p>Nhập mã sau trên màn hình quên mật khẩu TravelGo:</p><p style="padding:18px;background:#e2f1eb;border-radius:12px;font:bold 34px monospace;letter-spacing:8px;text-align:center">${escapeHtml(params.code)}</p><p>Mã có hiệu lực <strong>${params.expiresMinutes} phút</strong> và chỉ được sử dụng một lần.</p><p><strong>Không chia sẻ mã với bất kỳ ai.</strong> TravelGo không yêu cầu bạn cung cấp mã qua điện thoại hoặc tin nhắn.</p><p style="color:#526565">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại chưa bị thay đổi.</p></td></tr></table></td></tr></table></body></html>`;
  return { html, text };
}

/** Never logs recipients, codes, Gmail credentials, provider response bodies or raw exceptions. */
export function createGmailCodeSender(settings: GmailSettings, request: typeof fetch = fetch) {
  return async (params: ResetCodeMail): Promise<boolean> => {
    if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(settings.GMAIL_USER)) {
      console.warn('[ResetCodeMail] GMAIL_USER is not configured.');
      return false;
    }
    const message = {
      from: { name: 'TravelGo', address: settings.GMAIL_USER },
      to: params.to,
      subject: 'Mã xác nhận đặt lại mật khẩu TravelGo',
      ...renderResetCodeMail(params),
    };
    try {
      if (settings.PASSWORD_RESET_MAIL_PROVIDER === 'gmail-smtp') {
        if (!settings.GMAIL_APP_PASSWORD) {
          console.warn('[ResetCodeMail] Gmail App Password is not configured.');
          return false;
        }
        const transport = nodemailer.createTransport({
          host: 'smtp.gmail.com', port: 465, secure: true,
          auth: { user: settings.GMAIL_USER, pass: settings.GMAIL_APP_PASSWORD },
          connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
          logger: false, debug: false,
        });
        const result = await transport.sendMail(message);
        return result.accepted.length > 0;
      }

      if (!settings.GMAIL_OAUTH_CLIENT_ID || !settings.GMAIL_OAUTH_CLIENT_SECRET || !settings.GMAIL_OAUTH_REFRESH_TOKEN) {
        console.warn('[ResetCodeMail] Gmail API OAuth credentials are not configured.');
        return false;
      }
      const tokenResponse = await request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: settings.GMAIL_OAUTH_CLIENT_ID,
          client_secret: settings.GMAIL_OAUTH_CLIENT_SECRET,
          refresh_token: settings.GMAIL_OAUTH_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!tokenResponse.ok) throw new Error('Gmail authorization failed');
      const token = await tokenResponse.json() as { access_token?: string };
      if (!token.access_token) throw new Error('Gmail authorization failed');
      // Nodemailer composes standards-compliant UTF-8 MIME, including both plain text and HTML.
      const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
      const composed = await composer.sendMail(message);
      if (!Buffer.isBuffer(composed.message)) throw new Error('Gmail message composition failed');
      const response = await request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: composed.message.toString('base64url') }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Gmail send failed');
      return true;
    } catch {
      console.warn('[ResetCodeMail] Delivery failed. Check server-side Gmail settings and outbound connectivity.');
      return false;
    }
  };
}

export const sendPasswordResetCodeEmail = createGmailCodeSender(env);
