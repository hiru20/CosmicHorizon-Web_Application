import nodemailer from 'nodemailer';

/**
 * Builds a nodemailer transporter from environment variables.
 * Returns null when SMTP is not configured (development fallback).
 */
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

/**
 * Sends the account verification email.
 * If SMTP is not configured, the link is printed to the server console so the
 * project can still be demonstrated without any email account.
 */
export const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/verify-email/${rawToken}`;

  const transporter = createTransporter();
  if (!transporter) {
    console.log('\n[Email] SMTP not configured - verification link (dev mode):');
    console.log(`        ${user.email} -> ${link}\n`);
    return { sent: false, devLink: link };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `CosmicHorizon <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Verify your CosmicHorizon account',
    text: `Hi ${user.name},\n\nConfirm your email to activate your account:\n${link}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to CosmicHorizon, ${user.name}!</h2>
        <p>Please confirm your email address to activate your account.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#06b6d4;color:#000;text-decoration:none;border-radius:8px;font-weight:bold">Verify Email</a></p>
        <p style="color:#666;font-size:12px">This link expires in 24 hours. If you did not sign up, ignore this email.</p>
      </div>`,
  });

  return { sent: true };
};
