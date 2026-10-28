import nodemailer from 'nodemailer';

/**
 * Builds a nodemailer transporter from environment variables.
 * Supports Gmail (SMTP_HOST=smtp.gmail.com) as well as any custom SMTP provider
 * (Brevo, Resend, Mailgun, SendGrid, Outlook, etc.).
 */
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || SMTP_PASS.trim() === '') {
    return null;
  }

  const host = SMTP_HOST.trim();
  const port = Number(SMTP_PORT) || 465;
  const user = SMTP_USER.trim();
  // Strip spaces in case a 16-character Google App Password was pasted with spaces
  const pass = SMTP_PASS.replace(/\s+/g, '');

  if (host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

/**
 * Sends the real account verification email containing both:
 *  1) A 6-digit verification code (for instant entry on the Check Your Email screen)
 *  2) A one-click verification link (/verify-email/:token)
 */
export const sendVerificationEmail = async (user, rawToken, otpCode) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const link = `${clientUrl}/verify-email/${rawToken}`;

  const transporter = createTransporter();
  if (!transporter) {
    console.warn('\n[Email Warning] SMTP_PASS is not configured in server/.env.');
    console.warn(`                Verification code for ${user.email}: ${otpCode}`);
    console.warn(`                Verification link: ${link}\n`);
    return { sent: false, devLink: link };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `CosmicHorizon <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `${otpCode} is your CosmicHorizon verification code`,
    text: `Hi ${user.name},\n\nWelcome to CosmicHorizon!\n\nYour 6-digit verification code is: ${otpCode}\n\nOr click the link below to verify your email address directly:\n${link}\n\nThis code and link expire in 24 hours.`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b0f19;color:#e2e8f0;padding:32px;border-radius:16px;border:1px solid #1e293b">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:1px">COSMICHORIZON</h1>
          <p style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0">Space &amp; Orbit Tracker</p>
        </div>

        <h2 style="color:#ffffff;font-size:18px;margin-bottom:10px">Welcome aboard, ${user.name}!</h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:20px">
          Please verify your email address to activate your CosmicHorizon account. Enter this 6-digit verification code in the app:
        </p>

        <div style="text-align:center;margin:24px 0;padding:18px;background:#111827;border:1px solid #22d3ee;border-radius:12px">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Verification Code</div>
          <div style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#22d3ee">${otpCode}</div>
        </div>

        <p style="color:#94a3b8;font-size:13px;text-align:center;margin:20px 0">
          Or click the button below to verify automatically:
        </p>

        <div style="text-align:center;margin:24px 0">
          <a href="${link}" style="display:inline-block;padding:13px 28px;background:linear-gradient(90deg,#06b6d4,#4f46e5);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px">
            Verify My Email Address
          </a>
        </div>

        <p style="color:#64748b;font-size:12px;line-height:1.5;margin-top:24px;border-top:1px solid #1e293b;padding-top:16px">
          Direct link:<br/>
          <a href="${link}" style="color:#38bdf8;word-break:break-all">${link}</a>
        </p>
        <p style="color:#475569;font-size:11px;margin-top:12px">
          This verification code and link expire in 24 hours. If you did not create this account, you can safely ignore this email.
        </p>
      </div>`,
  });

  console.log(`[Email] Real verification email sent to ${user.email}`);
  return { sent: true };
};
