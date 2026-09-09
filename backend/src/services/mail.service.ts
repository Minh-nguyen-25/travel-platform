import { Resend } from 'resend';
import env from '../config/env';

/**
 * Escapes unsafe characters for safe interpolation into HTML email templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  expiresMinutes?: number;
  recipientName?: string;
}

// Module-level client instance (can be swapped in automated tests)
let resendClient: Resend | null = env.RESEND_CONFIGURED ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Helper to allow tests to mock or inject custom Resend client behavior.
 */
export const setResendClientForTesting = (client: Resend | null): void => {
  resendClient = client;
};

/**
 * Render responsive, premium HTML template for TravelGo password reset email.
 * Design Concept: "Hành trình Việt" — Deep oceanic teal (#0f766e), Sunset amber (#f59e0b),
 * warm slate background, bulletproof table structure, clean typography and high contrast.
 */
export const renderPasswordResetHtml = (
  resetUrl: string,
  expiresMinutes: number = 15,
  recipientName?: string
): string => {
  const safeResetUrl = escapeHtml(resetUrl);
  const safeName = recipientName ? escapeHtml(recipientName.trim()) : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Đặt lại mật khẩu TravelGo</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 28px 20px !important; }
      .header-padding { padding: 26px 20px !important; }
      .button-full { width: 100% !important; }
      .button-link { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <!-- Hidden Preheader for email inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #f8fafc; opacity: 0; mso-hide: all;">
    Sử dụng liên kết an toàn để đặt lại mật khẩu TravelGo của bạn.&#847; &zwnj; &nbsp; &#8199; &#65279;&#847; &zwnj; &nbsp; &#8199; &#65279;&#847; &zwnj; &nbsp; &#8199; &#65279;&#847; &zwnj; &nbsp; &#8199; &#65279;
  </div>

  <!-- Outer Wrapper Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; width: 100%; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px 16px;">
        <!-- Email Container Card (max-width 580px) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="container-table" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
          
          <!-- Header Banner (Deep Oceanic Teal with Amber Accent) -->
          <tr>
            <td bgcolor="#0f766e" class="header-padding" style="background-color: #0f766e; background-image: linear-gradient(145deg, #0f766e 0%, #115e59 100%); padding: 34px 36px 30px 36px; text-align: center;">
              <!-- Brand Wordmark -->
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                TravelGo
              </div>
              
              <!-- Tagline "HÀNH TRÌNH VIỆT" -->
              <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #ccfbf1; letter-spacing: 0.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                HÀNH TRÌNH VIỆT
              </div>

              <!-- Subtle Sunset Amber Accent Bar -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin-top: 12px;">
                <tr>
                  <td width="36" height="3" bgcolor="#f59e0b" style="background-color: #f59e0b; border-radius: 2px; line-height: 3px; font-size: 3px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card Body -->
          <tr>
            <td class="content-padding" style="padding: 38px 40px 36px 40px; background-color: #ffffff;">
              <!-- Heading -->
              <h1 style="margin: 0 0 16px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.35; letter-spacing: -0.3px;">
                Yêu cầu đặt lại mật khẩu
              </h1>

              <!-- Greeting & Explanation -->
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                ${safeName ? `Xin chào <strong>${safeName}</strong>,` : 'Xin chào,'}
              </p>
              <p style="margin: 0 0 26px 0; font-size: 15px; line-height: 1.65; color: #475569;">
                TravelGo vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới:
              </p>

              <!-- Bulletproof CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="button-full" style="margin: 28px auto;">
                <tr>
                  <td align="center" bgcolor="#0f766e" style="border-radius: 10px; background-color: #0f766e;">
                    <a href="${safeResetUrl}" target="_blank" rel="noopener noreferrer" class="button-link" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: #0f766e; border: 1px solid #0f766e;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box with Amber Accent Border -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 24px 0;">
                <tr>
                  <td style="background-color: #f0fdfa; border-radius: 8px; border: 1px solid #ccfbf1; border-left: 4px solid #f59e0b; padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; line-height: 1.5; color: #134e4a;">
                      Thông tin bảo mật quan trọng:
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.55; color: #0f766e;">
                      • Liên kết có hiệu lực trong vòng <strong>${expiresMinutes} phút</strong> và chỉ sử dụng được <strong>một lần duy nhất</strong>.
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #0f766e;">
                      • Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Mật khẩu hiện tại của bạn vẫn được giữ an toàn tuyệt đối.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Plain URL Fallback -->
              <p style="margin: 26px 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Nếu nút phía trên không hoạt động, bạn có thể sao chép và dán trực tiếp liên kết sau vào thanh địa chỉ của trình duyệt:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                    <a href="${safeResetUrl}" target="_blank" rel="noopener noreferrer" style="color: #0f766e; font-size: 12px; line-height: 1.5; word-break: break-all; text-decoration: underline;">
                      ${safeResetUrl}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider line -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td height="1" bgcolor="#f1f5f9" style="background-color: #f1f5f9; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Closing Sign-off -->
              <p style="margin: 0 0 6px 0; font-size: 14px; line-height: 1.6; color: #475569; font-style: italic;">
                Chúc bạn có những hành trình thật đáng nhớ cùng TravelGo.
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; line-height: 1.6; color: #334155;">
                Đội ngũ TravelGo
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="background-color: #f8fafc; padding: 22px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                &copy; 2026 TravelGo · Hành trình Việt
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Render plain-text fallback for email clients without HTML support.
 */
export const renderPasswordResetText = (
  resetUrl: string,
  expiresMinutes: number = 15,
  recipientName?: string
): string => {
  const greeting = recipientName ? `Xin chào ${recipientName.trim()},` : 'Xin chào,';

  return [
    'TravelGo — Hành trình Việt',
    '==========================',
    '',
    'Yêu cầu đặt lại mật khẩu',
    '',
    greeting,
    '',
    'TravelGo vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.',
    '',
    'Vui lòng truy cập liên kết sau để thiết lập mật khẩu mới:',
    resetUrl,
    '',
    'Thông tin bảo mật quan trọng:',
    `- Liên kết có hiệu lực trong vòng ${expiresMinutes} phút và chỉ sử dụng được một lần duy nhất.`,
    '- Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn an toàn.',
    '',
    'Chúc bạn có những hành trình thật đáng nhớ cùng TravelGo.',
    '',
    'Trân trọng,',
    'Đội ngũ TravelGo',
    '',
    '--------------------------------------------------',
    '© 2026 TravelGo · Hành trình Việt',
  ].join('\n');
};

/**
 * Mask email for safe logging (e.g. u***r@example.com)
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}*@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export const mailService = {
  /**
   * Sends a password reset email via Resend if configured.
   * Returns boolean indicating delivery success. Never throws raw errors upward.
   */
  async sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<boolean> {
    const {
      to,
      resetUrl,
      expiresMinutes = env.PASSWORD_RESET_EXPIRES_MINUTES,
      recipientName,
    } = params;
    const masked = maskEmail(to);

    if (!resendClient) {
      console.warn(
        `[MailService] RESEND_API_KEY chưa cấu hình hoặc không hợp lệ. Bỏ qua gửi email thực tế đến ${masked}.`
      );
      return false;
    }

    try {
      const { error } = await resendClient.emails.send({
        from: env.MAIL_FROM,
        to: [to],
        subject: 'Đặt lại mật khẩu TravelGo',
        html: renderPasswordResetHtml(resetUrl, expiresMinutes, recipientName),
        text: renderPasswordResetText(resetUrl, expiresMinutes, recipientName),
      });

      if (error) {
        console.error(`[MailService] Gửi email đến ${masked} thất bại:`, error.message);
        return false;
      }

      console.info(`[MailService] Đã gửi email đặt lại mật khẩu thành công đến ${masked}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[MailService] Lỗi kết nối Resend khi gửi đến ${masked}:`, message);
      return false;
    }
  },
};
