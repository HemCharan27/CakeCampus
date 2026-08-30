import { Client } from '@notionhq/client';
import { OrderDocument, OrderStatus } from './types';

let notionClient: Client | null = null;
const NOTION_API_KEY = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (NOTION_API_KEY) {
  notionClient = new Client({ auth: NOTION_API_KEY });
  console.log('📘 Notion client initialized.');
} else {
  console.log('ℹ️ Notion token not set. Notion database sync will operate in log-only mirror mode.');
}

const statusToNotionMap: Record<OrderStatus, string> = {
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_SUBMITTED: 'Payment Submitted',
  PAID_VERIFIED: 'Paid Verified',
  PAYMENT_REJECTED: 'Payment Rejected',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const formatItemsSummary = (items: OrderDocument['items']): string => {
  return items.map(item => {
    const details = [
      item.weightKey,
      item.flavourKey,
      item.toppingKeys?.length ? `Toppings: ${item.toppingKeys.join(', ')}` : null,
      item.addOnKeys?.length ? `Add-ons: ${item.addOnKeys.join(', ')}` : null,
    ].filter(Boolean).join(' | ');
    return `• ${item.qty}x ${item.cakeNameSnapshot} (${details}) - ₹${item.lineTotal}`;
  }).join('\n');
};

/**
 * Creates a mirrored row in the Notion "CakeCampus Orders" database.
 */
export const createNotionOrderRow = async (
  order: OrderDocument
): Promise<{ pageId?: string; pageUrl?: string }> => {
  if (!notionClient || !NOTION_DATABASE_ID) {
    console.log(`[Notion Mirror - Mock] Created entry for ${order.orderId} (Status: ${statusToNotionMap[order.status]})`);
    return {
      pageId: `mock-notion-page-${order.orderId}`,
      pageUrl: `https://notion.so/cakecampus-orders#${order.orderId}`
    };
  }

  try {
    const pickupDateStr = typeof order.pickupDate === 'string' 
      ? order.pickupDate.split('T')[0] 
      : order.pickupDate.toISOString().split('T')[0];

    const adminUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/admin?orderId=${order.orderId}` 
      : `http://localhost:3000/admin?orderId=${order.orderId}`;

    const response: any = await notionClient.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Order ID': {
          title: [
            { text: { content: order.orderId } }
          ]
        },
        'Status': {
          select: {
            name: statusToNotionMap[order.status] || 'Payment Pending'
          }
        },
        'Pickup Date': {
          date: {
            start: pickupDateStr
          }
        },
        'Total Amount': {
          number: order.totalAmount
        },
        'Delivery Charge': {
          number: order.deliveryCharge ?? 50
        },
        'Items Summary': {
          rich_text: [
            { text: { content: formatItemsSummary(order.items) } }
          ]
        },
        'Customer Name': {
          rich_text: [
            { text: { content: order.customer.name } }
          ]
        },
        'Phone': {
          rich_text: [
            { text: { content: order.customer.phone } }
          ]
        },
        'Email': {
          email: order.customer.email
        },
        'Roll Number': {
          rich_text: [
            { text: { content: order.customer.rollNumber } }
          ]
        },
        'Cake Message': {
          rich_text: [
            { text: { content: order.cakeMessage || 'None' } }
          ]
        },
        'UTR': {
          rich_text: [
            { text: { content: order.payment.utr || 'Pending' } }
          ]
        },
        'Payment Proof': {
          url: order.payment.screenshotUrl || null
        },
        'Admin Link': {
          url: adminUrl
        }
      }
    });

    console.log(`✅ Notion row created for order ${order.orderId} (Page ID: ${response.id})`);
    return {
      pageId: response.id,
      pageUrl: response.url || `https://notion.so/${response.id.replace(/-/g, '')}`
    };
  } catch (error: any) {
    console.error(`⚠️ Notion API error creating row for ${order.orderId}:`, error?.message || error);
    return {
      pageId: undefined,
      pageUrl: undefined
    };
  }
};

/**
 * Updates an existing Notion order row when status changes (e.g. to PAID, PREPARING, READY_FOR_PICKUP, COMPLETED, CANCELLED).
 */
export const updateNotionOrderStatus = async (
  pageId: string,
  newStatus: OrderStatus,
  extraDetails?: { utr?: string }
): Promise<boolean> => {
  if (!pageId || pageId.startsWith('mock-notion-page')) {
    console.log(`[Notion Mirror - Mock] Updated status for page ${pageId} to "${statusToNotionMap[newStatus]}"`);
    return true;
  }

  if (!notionClient) {
    return false;
  }

  try {
    const properties: any = {
      'Status': {
        select: {
          name: statusToNotionMap[newStatus] || newStatus
        }
      }
    };

    if (extraDetails?.utr) {
      properties['UTR'] = {
        rich_text: [
          { text: { content: extraDetails.utr } }
        ]
      };
    }

    await notionClient.pages.update({
      page_id: pageId,
      properties
    });

    console.log(`✅ Notion page ${pageId} updated with status "${statusToNotionMap[newStatus]}"`);
    return true;
  } catch (error: any) {
    console.error(`⚠️ Notion API error updating page ${pageId}:`, error?.message || error);
    return false;
  }
};
