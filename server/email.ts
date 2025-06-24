import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

export async function sendOrderReceipt(orderData: OrderReceiptData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured, skipping email send');
    return false;
  }

  try {
    const emailHtml = generateReceiptHTML(orderData);
    
    const msg = {
      to: orderData.customerEmail,
      from: 'orders@martinlawrencegalleries.com', // Verified sender
      subject: `Order Receipt #${orderData.orderId} - Martin Lawrence Galleries`,
      html: emailHtml,
      text: generateReceiptText(orderData)
    };

    await sgMail.send(msg);
    console.log(`Receipt sent successfully to ${orderData.customerEmail} for order #${orderData.orderId}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
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
          <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">MARTIN LAWRENCE GALLERIES</h1>
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
            <p style="margin: 10px 0;">Thank you for your purchase from Martin Lawrence Galleries!</p>
            <p style="margin: 10px 0;">If you have any questions about your order, please contact us.</p>
            <p style="margin: 20px 0 0 0;">
              <strong>Martin Lawrence Galleries</strong><br>
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
MARTIN LAWRENCE GALLERIES
Order Confirmation

Order #${data.orderId}
Date: ${data.orderDate}
Customer: ${data.customerName}
Email: ${data.customerEmail}
Payment Method: ${data.paymentMethod}

ORDER ITEMS:
${itemsText}

TOTAL: $${data.orderTotal.toFixed(2)}

Thank you for your purchase from Martin Lawrence Galleries!
If you have any questions about your order, please contact us.

Martin Lawrence Galleries
Email: info@martinlawrencegalleries.com
Phone: (800) 646-1010
  `;
}