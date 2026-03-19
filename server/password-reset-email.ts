import nodemailer from 'nodemailer';

// Create SMTP transporter for talantaart.com hosted email
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration missing. Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@talantaart.com';

interface PasswordResetData {
  artistName: string;
  artistEmail: string;
  resetToken: string;
  expiresAt: string;
}

export async function sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('SMTP not configured, skipping password reset email');
    return false;
  }

  try {
    const subject = `Reset Your Talanta Art Gallery Password`;
    const htmlContent = generatePasswordResetHTML(data);
    const textContent = generatePasswordResetText(data);

    const mailOptions = {
      from: FROM_EMAIL,
      to: data.artistEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${data.artistEmail}`);
    return true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
}

function generatePasswordResetHTML(data: PasswordResetData): string {
  const resetUrl = `${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/artist/reset-password?token=${data.resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5A2B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .reset-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #8B5A2B; }
        .reset-btn { background: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>Talanta Art Gallery Artist Portal</p>
        </div>
        
        <div class="content">
          <div class="reset-box">
            <h2>Hello ${data.artistName},</h2>
            <p>We received a request to reset your password for your Talanta Art Gallery artist account.</p>
            
            <p>If you requested this password reset, click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="reset-btn">Reset My Password</a>
            
            <p><strong>This link will expire on ${data.expiresAt}.</strong></p>
          </div>
          
          <div class="warning">
            <h3>⚠️ Security Notice</h3>
            <ul>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this reset link with anyone</li>
              <li>The link will expire in 1 hour for security</li>
              <li>You can only use this link once</li>
            </ul>
          </div>
          
          <div class="reset-box">
            <h3>Alternative Reset Link</h3>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent from Talanta Art Gallery</p>
          <p>If you have any questions, please contact our support team</p>
          <p>© ${new Date().getFullYear()} Talanta Art Gallery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePasswordResetText(data: PasswordResetData): string {
  const resetUrl = `${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/artist/reset-password?token=${data.resetToken}`;
  
  return `
PASSWORD RESET REQUEST

Hello ${data.artistName},

We received a request to reset your password for your Talanta Art Gallery artist account.

If you requested this password reset, visit the following link to create a new password:

${resetUrl}

IMPORTANT SECURITY INFORMATION:
- This link will expire on ${data.expiresAt}
- You can only use this link once
- If you didn't request this password reset, please ignore this email
- Never share this reset link with anyone

If the link doesn't work, copy and paste it directly into your web browser.

---
Talanta Art Gallery
This is an automated email. Please do not reply.

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Talanta Art Gallery. All rights reserved.
  `;
}