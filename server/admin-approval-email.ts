import nodemailer from 'nodemailer';

// Create SMTP transporter for emails
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration missing for emails');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@talantaart.com';

interface ArtistRegistrationData {
  artistName: string;
  artistEmail: string;
  artistBio: string;
  artistSpecialty: string;
  registrationDate: string;
  artistId: number;
}

export async function sendArtistRegistrationConfirmation(data: ArtistRegistrationData): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('SMTP not configured, skipping registration confirmation email');
    return false;
  }

  try {
    const htmlContent = generateRegistrationConfirmationHTML(data);
    const textContent = generateRegistrationConfirmationText(data);

    const mailOptions = {
      from: FROM_EMAIL,
      to: data.artistEmail,
      subject: `Welcome to Talanta Art Gallery - Registration Received`,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration confirmation email sent to: ${data.artistEmail}`);
    return true;
  } catch (error) {
    console.error('Registration confirmation email error:', error);
    return false;
  }
}

function generateRegistrationConfirmationHTML(data: ArtistRegistrationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5A2B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .message-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #8B5A2B; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Thank You for Registering!</h1>
          <p>Talanta Art Gallery</p>
        </div>
        
        <div class="content">
          <div class="message-box">
            <h2>Hello ${data.artistName},</h2>
            <p>Thank you for registering as an artist with Talanta Art Gallery!</p>
            <p>We have received your registration and it is currently under review by our admin team. You will receive another email once your account has been approved or if further information is needed.</p>
            <p><strong>Registration Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${data.artistName}</li>
              <li><strong>Email:</strong> ${data.artistEmail}</li>
              <li><strong>Specialty:</strong> ${data.artistSpecialty}</li>
              <li><strong>Registration Date:</strong> ${data.registrationDate}</li>
            </ul>
            <p>Please keep an eye on your inbox (and spam/junk folder) for updates regarding your account status.</p>
          </div>
        </div>

        <div class="footer">
          <p>Talanta Art Gallery</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateRegistrationConfirmationText(data: ArtistRegistrationData): string {
  return `
THANK YOU FOR REGISTERING WITH TALANTA ART GALLERY!

Hello ${data.artistName},

Thank you for registering as an artist with Talanta Art Gallery!

We have received your registration and it is currently under review by our admin team. You will receive another email once your account has been approved or if further information is needed.

REGISTRATION DETAILS:
- Name: ${data.artistName}
- Email: ${data.artistEmail}
- Specialty: ${data.artistSpecialty}
- Registration Date: ${data.registrationDate}

Please keep an eye on your inbox (and spam/junk folder) for updates regarding your account status.

Talanta Art Gallery
If you have any questions, please contact our support team.
  `;
}

export async function sendArtistRegistrationApprovalRequest(data: ArtistRegistrationData): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('SMTP not configured, skipping admin approval email');
    return false;
  }

  try {
    const htmlContent = generateArtistApprovalHTML(data);
    const textContent = generateArtistApprovalText(data);

    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Artist Registration - Approval Required: ${data.artistName}`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '2', // High priority
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin approval email sent for artist registration: ${data.artistName}`);
    return true;
  } catch (error) {
    console.error('Admin approval email error:', error);
    return false;
  }
}

function generateArtistApprovalHTML(data: ArtistRegistrationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5A2B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .artist-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8B5A2B; }
        .actions { background: white; padding: 20px; margin: 20px 0; text-align: center; }
        .approve-btn { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px; }
        .reject-btn { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px; }
        .info-label { font-weight: bold; color: #8B5A2B; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 New Artist Registration</h1>
          <p>Approval Required</p>
        </div>
        
        <div class="content">
          <h2>Artist Details</h2>
          
          <div class="artist-info">
            <p><span class="info-label">Name:</span> ${data.artistName}</p>
            <p><span class="info-label">Email:</span> ${data.artistEmail}</p>
            <p><span class="info-label">Specialty:</span> ${data.artistSpecialty}</p>
            <p><span class="info-label">Registration Date:</span> ${data.registrationDate}</p>
          </div>

          <div class="artist-info">
            <p><span class="info-label">Bio:</span></p>
            <p>${data.artistBio}</p>
          </div>

          <div class="actions">
            <h3>Admin Actions Required</h3>
            <p>Please review this artist registration and take action:</p>
            
            <a href="${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/admin/artists/approve/${data.artistId}" class="approve-btn">
              ✅ Approve Artist
            </a>
            
            <a href="${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/admin/artists/reject/${data.artistId}" class="reject-btn">
              ❌ Reject Artist
            </a>
          </div>

          <div class="artist-info">
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Click "Approve Artist" to allow login access</li>
              <li>Click "Reject Artist" to deny registration</li>
              <li>The artist will be notified of your decision automatically</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>Talanta Art Gallery Admin System</p>
          <p>This is an automated notification from the artist registration system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateArtistApprovalText(data: ArtistRegistrationData): string {
  return `
NEW ARTIST REGISTRATION - APPROVAL REQUIRED

Artist Details:
- Name: ${data.artistName}
- Email: ${data.artistEmail}
- Specialty: ${data.artistSpecialty}
- Registration Date: ${data.registrationDate}

Bio:
${data.artistBio}

ADMIN ACTION REQUIRED:
Please log into the admin panel to review and approve/reject this artist registration.

Admin Panel: ${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/admin

Once approved, the artist will be able to log into their account and start managing their portfolio.

---
Talanta Art Gallery Admin System
This is an automated notification.
  `;
}

export async function sendArtistApprovalNotification(artistEmail: string, artistName: string, approved: boolean): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('SMTP not configured, skipping artist approval notification');
    return false;
  }

  try {
    const subject = approved 
      ? `Welcome to Talanta Art Gallery - Your Account is Approved!`
      : `Talanta Art Gallery Registration Update`;

    const htmlContent = approved 
      ? generateApprovedArtistHTML(artistName)
      : generateRejectedArtistHTML(artistName);
      
    const textContent = approved 
      ? generateApprovedArtistText(artistName)
      : generateRejectedArtistText(artistName);

    const mailOptions = {
      from: FROM_EMAIL,
      to: artistEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Artist ${approved ? 'approval' : 'rejection'} notification sent to: ${data.artistEmail}`);
    return true;
  } catch (error) {
    console.error('Artist approval notification error:', error);
    return false;
  }
}

function generateApprovedArtistHTML(artistName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .welcome-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745; }
        .login-btn { background: #8B5A2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Talanta Art Gallery!</h1>
          <p>Your artist account has been approved</p>
        </div>
        
        <div class="content">
          <div class="welcome-box">
            <h2>Congratulations, ${artistName}!</h2>
            <p>We're excited to welcome you to the Talanta Art Gallery community. Your artist account has been reviewed and approved by our admin team.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Log into your artist dashboard</li>
              <li>Upload and manage your artwork portfolio</li>
              <li>Track your orders and sales</li>
              <li>Update your artist profile and settings</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/artist/login" class="login-btn">
                Access Your Dashboard
              </a>
            </div>
          </div>

          <div class="welcome-box">
            <h3>Getting Started</h3>
            <p>Use the same email and password you registered with to access your artist dashboard. From there, you can:</p>
            <ul>
              <li>Complete your artist profile</li>
              <li>Add artwork to your portfolio</li>
              <li>View customer orders</li>
              <li>Manage your account settings</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>Welcome to Talanta Art Gallery</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateApprovedArtistText(artistName: string): string {
  return `
WELCOME TO TALANTA ART GALLERY!

Congratulations, ${artistName}!

Your artist account has been reviewed and approved by our admin team. We're excited to welcome you to the Talanta Art Gallery community.

WHAT'S NEXT:
- Log into your artist dashboard
- Upload and manage your artwork portfolio  
- Track your orders and sales
- Update your artist profile and settings

LOGIN TO YOUR DASHBOARD:
${process.env.LIVE_SITE_URL ? `https://${process.env.LIVE_SITE_URL.split(',')[0]}` : 'https://talantaart.com'}/artist/login

Use the same email and password you registered with to access your account.

GETTING STARTED:
From your dashboard, you can:
- Complete your artist profile
- Add artwork to your portfolio
- View customer orders
- Manage your account settings

Welcome to Talanta Art Gallery!
If you have any questions, please contact our support team.
  `;
}

function generateRejectedArtistHTML(artistName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .message-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Talanta Art Gallery Registration Update</h1>
        </div>
        
        <div class="content">
          <div class="message-box">
            <h2>Hello ${artistName},</h2>
            <p>Thank you for your interest in joining Talanta Art Gallery as an artist.</p>
            
            <p>After careful review, we're unable to approve your artist registration at this time. This decision may be based on various factors including portfolio requirements, gallery fit, or current capacity.</p>
            
            <p>We encourage you to continue developing your artistic practice and consider reapplying in the future.</p>
            
            <p>Thank you for your understanding.</p>
          </div>
        </div>

        <div class="footer">
          <p>Talanta Art Gallery</p>
          <p>If you have questions about this decision, please contact our team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateRejectedArtistText(artistName: string): string {
  return `
TALANTA ART GALLERY REGISTRATION UPDATE

Hello ${artistName},

Thank you for your interest in joining Talanta Art Gallery as an artist.

After careful review, we're unable to approve your artist registration at this time. This decision may be based on various factors including portfolio requirements, gallery fit, or current capacity.

We encourage you to continue developing your artistic practice and consider reapplying in the future.

Thank you for your understanding.

Talanta Art Gallery
If you have questions about this decision, please contact our team.
  `;
}