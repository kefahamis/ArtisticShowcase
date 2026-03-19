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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@talantaart.com';

interface OrderReceiptData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  items: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  orderDate: string;
  paymentMethod: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

interface AppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  submittedAt: string;
}

export async function sendOrderReceipt(orderData: OrderReceiptData): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP not configured, skipping email send');
    return false;
  }

  try {
    const emailHtml = generateReceiptHTML(orderData);
    
    const mailOptions = {
      from: FROM_EMAIL,
      to: orderData.customerEmail,
      subject: `Order Receipt #${orderData.orderId} - Talanta Art Gallery`,
      html: emailHtml,
      text: generateReceiptText(orderData)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Receipt sent successfully to ${orderData.customerEmail} for order #${orderData.orderId}`);
    return true;
  } catch (error) {
    console.error('SMTP email error:', error);
    return false;
  }
}

export async function sendContactFormEmail(contactData: ContactFormData): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP not configured, skipping email send');
    return false;
  }

  try {
    // Send notification to admin
    const adminMailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${contactData.subject}`,
      html: generateContactFormAdminHTML(contactData),
      text: generateContactFormAdminText(contactData)
    };

    // Send confirmation to customer
    const customerMailOptions = {
      from: FROM_EMAIL,
      to: contactData.email,
      subject: 'Thank you for contacting Talanta Art Gallery',
      html: generateContactFormCustomerHTML(contactData),
      text: generateContactFormCustomerText(contactData)
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);
    console.log(`Contact form emails sent successfully for ${contactData.name}`);
    return true;
  } catch (error) {
    console.error('SMTP contact form email error:', error);
    return false;
  }
}

export async function sendAppointmentEmail(appointmentData: AppointmentData): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP not configured, skipping email send');
    return false;
  }

  try {
    // Send notification to admin
    const adminMailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Appointment Request - ${appointmentData.appointmentType}`,
      html: generateAppointmentAdminHTML(appointmentData),
      text: generateAppointmentAdminText(appointmentData)
    };

    // Send confirmation to customer
    const customerMailOptions = {
      from: FROM_EMAIL,
      to: appointmentData.email,
      subject: 'Appointment Request Received - Talanta Art Gallery',
      html: generateAppointmentCustomerHTML(appointmentData),
      text: generateAppointmentCustomerText(appointmentData)
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);
    console.log(`Appointment emails sent successfully for ${appointmentData.firstName} ${appointmentData.lastName}`);
    return true;
  } catch (error) {
    console.error('SMTP appointment email error:', error);
    return false;
  }
}

function generateReceiptHTML(data: OrderReceiptData): string {
  const itemsHtml = data.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 0; color: #333;">${item.title}</td>
      <td style="padding: 12px 0; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #333;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px 0; text-align: right; color: #333;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Order Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #000; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">TALANTA ART GALLERY</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order Confirmation</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Order #${data.orderId}</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${data.orderDate}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${data.customerName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${data.customerEmail}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>

          <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">Order Items</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 12px 0; text-align: left; color: #495057; font-weight: 600;">Item</th>
                <th style="padding: 12px 0; text-align: center; color: #495057; font-weight: 600;">Qty</th>
                <th style="padding: 12px 0; text-align: right; color: #495057; font-weight: 600;">Price</th>
                <th style="padding: 12px 0; text-align: right; color: #495057; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #000; padding-top: 20px;">
            <div style="text-align: right;">
              <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #000;">
                Total: $${data.orderTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p style="margin: 10px 0;">Thank you for your purchase from Talanta Art Gallery!</p>
            <p style="margin: 10px 0;">If you have any questions about your order, please contact us.</p>
            <p style="margin: 20px 0 0 0;">
              <strong>Talanta Art Gallery</strong><br>
              Email: info@martinlawrencegalleries.com<br>
              Phone: (800) 646-1010
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateReceiptText(data: OrderReceiptData): string {
  const itemsText = data.items.map(item => 
    `${item.title} - Qty: ${item.quantity} - $${item.price.toFixed(2)} each - Total: $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return `
TALANTA ART GALLERY
Order Confirmation

Order #${data.orderId}
Date: ${data.orderDate}
Customer: ${data.customerName}
Email: ${data.customerEmail}
Payment Method: ${data.paymentMethod}

ORDER ITEMS:
${itemsText}

TOTAL: $${data.orderTotal.toFixed(2)}

Thank you for your purchase from Talanta Art Gallery!
If you have any questions about your order, please contact us.

Talanta Art Gallery
Email: info@talantaart.com
Phone: (800) 646-1010
  `;
}

// Contact Form Email Functions
function generateContactFormAdminHTML(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Contact Form Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: normal;">New Contact Form Submission</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Contact Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${data.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
            <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${data.subject}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${data.submittedAt}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Message</h3>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Talanta Art Gallery Admin Panel
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateContactFormAdminText(data: ContactFormData): string {
  return `
NEW CONTACT FORM SUBMISSION

Contact Details:
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Subject: ${data.subject}
Submitted: ${data.submittedAt}

Message:
${data.message}

Please respond to this inquiry promptly.
  `.trim();
}

function generateContactFormCustomerHTML(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Thank you for contacting us</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #000; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">TALANTA ART GALLERY</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your inquiry</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">Dear ${data.name},</p>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.8;">
            Thank you for contacting Talanta Art Gallery. We have received your inquiry regarding "${data.subject}" and will respond within 24 hours.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Your Message</h3>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${data.message}</p>
          </div>

          <p style="margin: 20px 0 0 0; color: #666; line-height: 1.8;">
            In the meantime, feel free to explore our current exhibitions and featured artworks on our website.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Best regards,<br>
              The Talanta Art Gallery Team
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            <strong>Talanta Art Gallery</strong><br>
            123 Art District Avenue, Chelsea, New York, NY 10001<br>
            (555) 123-4567 | contact@martinlawrencegalleries.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateContactFormCustomerText(data: ContactFormData): string {
  return `
TALANTA ART GALLERY

Dear ${data.name},

Thank you for contacting Talanta Art Gallery. We have received your inquiry regarding "${data.subject}" and will respond within 24 hours.

Your Message:
${data.message}

In the meantime, feel free to explore our current exhibitions and featured artworks on our website.

Best regards,
The Talanta Art Gallery Team

Talanta Art Gallery
123 Art District Avenue
Chelsea, New York, NY 10001
(555) 123-4567
contact@martinlawrencegalleries.com
  `.trim();
}

// Appointment Email Functions
function generateAppointmentAdminHTML(data: AppointmentData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>New Appointment Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #16a34a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: normal;">New Appointment Request</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Contact Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
            <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${data.submittedAt}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Appointment Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${data.appointmentType}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Preferred Time:</strong> ${data.preferredTime}</p>
          </div>

          ${data.message ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Additional Message</h3>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${data.message}</p>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Talanta Art Gallery Admin Panel
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAppointmentAdminText(data: AppointmentData): string {
  return `
NEW APPOINTMENT REQUEST

Contact Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Submitted: ${data.submittedAt}

Appointment Details:
Type: ${data.appointmentType}
Preferred Date: ${data.preferredDate}
Preferred Time: ${data.preferredTime}

${data.message ? `Additional Message:
${data.message}` : ''}

Please contact the client to confirm the appointment.
  `.trim();
}

function generateAppointmentCustomerHTML(data: AppointmentData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Appointment Request Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #000; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">TALANTA ART GALLERY</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Appointment Request Received</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">Dear ${data.firstName} ${data.lastName},</p>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.8;">
            Thank you for your appointment request. We have received your request for a ${data.appointmentType} and will contact you within 24 hours to confirm the details.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Your Appointment Request</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${data.appointmentType}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Preferred Time:</strong> ${data.preferredTime}</p>
            ${data.message ? `<p style="margin: 5px 0; color: #666;"><strong>Message:</strong> ${data.message}</p>` : ''}
          </div>

          <p style="margin: 20px 0 0 0; color: #666; line-height: 1.8;">
            We look forward to welcoming you to our gallery and helping you discover the perfect artwork for your collection.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Best regards,<br>
              The Talanta Art Gallery Team
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            <strong>Talanta Art Gallery</strong><br>
            123 Art District Avenue, Chelsea, New York, NY 10001<br>
            (555) 123-4567 | contact@martinlawrencegalleries.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAppointmentCustomerText(data: AppointmentData): string {
  return `
TALANTA ART GALLERY

Dear ${data.firstName} ${data.lastName},

Thank you for your appointment request. We have received your request for a ${data.appointmentType} and will contact you within 24 hours to confirm the details.

Your Appointment Request:
Type: ${data.appointmentType}
Preferred Date: ${data.preferredDate}
Preferred Time: ${data.preferredTime}
${data.message ? `Message: ${data.message}` : ''}

We look forward to welcoming you to our gallery and helping you discover the perfect artwork for your collection.

Best regards,
The Talanta Art Gallery Team

Talanta Art Gallery
123 Moi Avenue
Nairobi, Kenya
(555) 123-4567
info@talantaart.com
  `.trim();
}