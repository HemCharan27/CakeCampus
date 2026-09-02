import { OrderDocument } from './types';

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

const formatItemsSummary = (items: OrderDocument['items']): string => {
  return items.map(item => {
    const details = [
      item.weightKey,
      item.flavourKey,
      item.toppingKeys?.length ? `Toppings: ${item.toppingKeys.join(', ')}` : null,
      item.addOnKeys?.length ? `Add-ons: ${item.addOnKeys.join(', ')}` : null,
    ].filter(Boolean).join(' | ');
    return `• ${item.qty}x ${item.cakeNameSnapshot} (${details})`;
  }).join('\n');
};

/**
 * Sends order data to a Google Apps Script Web App to append to a Google Sheet.
 * This function will silently exit if GOOGLE_SHEETS_WEBHOOK_URL is not set in .env
 */
export const appendToGoogleSheet = async (order: OrderDocument): Promise<void> => {
  if (!WEBHOOK_URL) return;

  try {
    const pickupDateStr = typeof order.pickupDate === 'string' 
      ? order.pickupDate.split('T')[0] 
      : order.pickupDate.toISOString().split('T')[0];

    const payload = {
      orderId: order.orderId,
      date: new Date(order.createdAt).toISOString(),
      status: order.status,
      customerName: order.customer.name,
      phone: order.customer.phone,
      college: order.customer.college || 'N/A',
      items: formatItemsSummary(order.items),
      amount: order.totalAmount,
      pickupDate: pickupDateStr,
      utr: order.payment.utr || 'Pending'
    };

    // Fire and forget, we don't want to block the customer checkout if Google Sheets is slow
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.error('Google Sheets sync network error:', e.message));

    console.log(`✅ Pushed order ${order.orderId} to Google Sheets webhook`);
  } catch (error: any) {
    console.error(`⚠️ Failed to format payload for Google Sheets:`, error?.message);
  }
};
