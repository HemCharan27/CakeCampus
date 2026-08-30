import nodemailer from 'nodemailer';
import { OrderDocument } from './types';

let transporter: nodemailer.Transporter | null = null;

const setupTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Nodemailer SMTP transporter configured.');
  } else {
    console.log('ℹ️ SMTP credentials not configured. Emails will be logged to console / mock dispatched.');
  }
};

setupTransporter();

const sentEmailOrders = new Set<string>();

const formatItemsHtml = (order: OrderDocument): string => {
  return order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0;">
        <strong>${item.cakeNameSnapshot}</strong> x ${item.qty}<br/>
        <span style="font-size: 12px; color: #666;">
          Weight: ${item.weightKey} | Flavour: ${item.flavourKey}
          ${item.toppingKeys?.length ? `<br/>Toppings: ${item.toppingKeys.join(', ')}` : ''}
          ${item.addOnKeys?.length ? `<br/>Add-ons: ${item.addOnKeys.join(', ')}` : ''}
        </span>
      </td>
      <td style="padding: 10px 0; text-align: right; font-weight: bold;">₹${item.lineTotal}</td>
    </tr>
  `).join('');
};

const getPickupDate = (order: OrderDocument): string =>
  typeof order.pickupDate === 'string' ? order.pickupDate.split('T')[0] : order.pickupDate.toISOString().split('T')[0];

const fromAddr = () => process.env.MAIL_FROM || 'CakeCampus <orders@cakecampus.edu>';
const adminAddr = () => process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL || 'admin@cakecampus.edu';

const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!transporter) {
    console.log(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
    return true;
  }
  try {
    await transporter.sendMail({ from: fromAddr(), to, subject, html });
    console.log(`✉️ Email sent to ${to}: ${subject}`);
    return true;
  } catch (e: any) {
    console.error(`Failed to send email to ${to}:`, e?.message || e);
    return false;
  }
};

/** Sent when order is created (PAYMENT_PENDING) — instructs customer to pay and submit UTR */
export const sendOrderCreatedEmail = async (order: OrderDocument): Promise<boolean> => {
  const pickupDate = getPickupDate(order);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2A050F; background: #FAF7F5; padding: 24px; border-radius: 12px; border: 1px solid #F3EAE3;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #E11D48; margin-bottom: 4px;">🎂 CakeCampus</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Order Received — Payment Required</p>
      </div>
      <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px;">
        <h2 style="color: #D97706; margin-top: 0;">⏳ Payment Pending</h2>
        <p>Hi <strong>${order.customer.name}</strong>,</p>
        <p>Your order <strong style="color: #E11D48;">${order.orderId}</strong> has been created. Please complete payment to confirm.</p>
        <div style="background: #FFF7ED; padding: 14px; border-radius: 8px; border: 1px solid #FED7AA; margin: 16px 0;">
          <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> ₹${order.totalAmount}</p>
          <p style="margin: 0 0 6px 0;"><strong>UPI ID:</strong> <code>${order.payment.upiId}</code></p>
          <p style="margin: 0 0 6px 0;"><strong>Note:</strong> ${order.payment.upiNote}</p>
          <p style="margin: 0;"><strong>Pickup Date:</strong> ${pickupDate}</p>
        </div>
        <p style="font-size: 13px; color: #666;">After paying, go back to the order page and submit your UTR / Transaction ID. Your order will be confirmed once we verify the payment.</p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">CakeCampus • Made with ❤️ for Campus Celebrations</p>
    </div>`;
  return sendMail(order.customer.email, `CakeCampus Order #${order.orderId} — Please Complete Payment`, html);
};

/** Sent when admin verifies payment (PAID_VERIFIED) or completes order (COMPLETED) */
export const sendPaymentConfirmationEmails = async (
  order: OrderDocument,
  forceResend: boolean = false
): Promise<{ customerSent: boolean; adminSent: boolean }> => {
  if (!forceResend && sentEmailOrders.has(order.orderId)) {
    return { customerSent: true, adminSent: true };
  }

  const pickupDate = getPickupDate(order);
  const itemsTableHtml = formatItemsHtml(order);
  const collegeName = order.college || order.customer.college || 'Campus';
  const pickupPoint = order.pickupPoint || 'CakeCampus Point';

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2A050F; background: #FAF7F5; padding: 24px; border-radius: 12px; border: 1px solid #F3EAE3;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #E11D48; margin-bottom: 4px; font-size: 26px;">🎂 CakeCampus</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Campus Pre-Order Confirmation & Receipt</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="text-align: center; margin-bottom: 16px;">
          <span style="background: #ECFDF5; color: #059669; font-weight: bold; font-size: 14px; padding: 6px 16px; border-radius: 20px; border: 1px solid #A7F3D0; display: inline-block;">
            ✓ Order Placed & Payment Verified
          </span>
        </div>
        <h2 style="color: #2A050F; margin-top: 10px; font-size: 18px;">Hi ${order.customer.name},</h2>
        <p style="color: #555; line-height: 1.5; font-size: 14px;">Your cake pre-order <strong style="color: #E11D48;">#${order.orderId}</strong> has been successfully placed and verified. Here are your complete order details:</p>
        
        <div style="background: #FFF1F2; padding: 16px; border-radius: 8px; border: 1px solid #FECDD3; margin: 16px 0;">
          <table style="width: 100%; font-size: 13px; color: #333;">
            <tr><td style="padding: 4px 0; font-weight: bold; width: 40%;">Order ID:</td><td style="padding: 4px 0; color: #E11D48; font-weight: bold; font-size: 15px;">#${order.orderId}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">College / Campus:</td><td style="padding: 4px 0;">${collegeName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Pickup Location:</td><td style="padding: 4px 0;"><strong>${pickupPoint}</strong></td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Pickup Date:</td><td style="padding: 4px 0; font-weight: bold; color: #059669;">${pickupDate}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Student Roll No:</td><td style="padding: 4px 0;">${order.customer.rollNumber}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Student Phone:</td><td style="padding: 4px 0;">${order.customer.phone}</td></tr>
            ${order.payment.utr ? `<tr><td style="padding: 4px 0; font-weight: bold;">UPI UTR / Trans ID:</td><td style="padding: 4px 0; font-family: monospace;">${order.payment.utr}</td></tr>` : ''}
          </table>
        </div>

        ${order.cakeMessage ? `
          <div style="background: #FAF5FF; padding: 12px 16px; border-radius: 8px; border: 1px solid #E9D5FF; margin: 12px 0; font-size: 13px;">
            <strong style="color: #7E22CE;">Message on Cake:</strong> <em>"${order.cakeMessage}"</em>
          </div>
        ` : ''}

        <h3 style="border-bottom: 2px solid #F3EAE3; padding-bottom: 8px; margin-top: 20px; font-size: 15px; color: #2A050F;">Customized Item Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
          ${itemsTableHtml}
          <tr><td style="padding: 8px 0; color: #666;">Items Subtotal</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${order.itemsTotal}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Campus Delivery / Handling Fee</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${order.deliveryCharge}</td></tr>
          <tr style="border-top: 2px solid #E11D48; font-size: 16px;">
            <td style="padding: 12px 0; font-weight: bold; color: #2A050F;">Total Paid</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #E11D48;">₹${order.totalAmount}</td>
          </tr>
        </table>

        <div style="background: #F0FDF4; padding: 14px; border-radius: 8px; border: 1px solid #BBF7D0; font-size: 13px; color: #166534; line-height: 1.5;">
          <strong>Pickup Instructions:</strong><br/>
          Present your Order ID <strong>#${order.orderId}</strong> or student ID at <strong>${pickupPoint}</strong> on <strong>${pickupDate}</strong> to collect your fresh cake.
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">CakeCampus • Fresh On-Campus Bakery Pre-Orders</p>
    </div>`;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #E11D48;">🎂 Order Confirmed: #${order.orderId}</h2>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount} (Paid via UPI)</p>
      <p><strong>UTR:</strong> ${order.payment.utr || 'N/A'}</p>
      <p><strong>Campus / Pickup:</strong> ${collegeName} - ${pickupPoint} on ${pickupDate}</p>
      <h3>Customer Information</h3>
      <ul>
        <li><strong>Name:</strong> ${order.customer.name}</li>
        <li><strong>Roll Number:</strong> ${order.customer.rollNumber}</li>
        <li><strong>Phone:</strong> ${order.customer.phone}</li>
        <li><strong>Email:</strong> ${order.customer.email}</li>
        <li><strong>Message on Cake:</strong> ${order.cakeMessage || 'None'}</li>
      </ul>
      <h3>Items</h3>
      <table style="width: 100%; border-collapse: collapse;">${itemsTableHtml}</table>
    </div>`;

  const customerSent = await sendMail(order.customer.email, `🎉 Order Confirmed #${order.orderId} - CakeCampus (${pickupDate})`, customerHtml);
  const adminSent = await sendMail(adminAddr(), `[Verified Order] #${order.orderId} - ₹${order.totalAmount} by ${order.customer.name}`, adminHtml);

  sentEmailOrders.add(order.orderId);
  return { customerSent, adminSent };
};

export const sendOrderConfirmationEmail = sendPaymentConfirmationEmails;

