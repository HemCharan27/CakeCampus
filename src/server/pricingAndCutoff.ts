import { DateTime } from 'luxon';
import { CakeDocument, CreateOrderRequest, OrderItemSnapshot } from './types';
import { getCakeById, getSettingValue } from './models';

export interface PriceCalculationResult {
  items: OrderItemSnapshot[];
  itemsTotal: number;
  deliveryCharge: number;
  totalAmount: number;
}

export interface CutoffCheckResult {
  isValid: boolean;
  cutoffIST: string;
  nowIST: string;
  reason?: string;
}

const IST_ZONE = 'Asia/Kolkata';

/**
 * Validates pre-order cutoff rule:
 * For pickup date D, order must be placed by (D - 1) at 18:00 (6:00 PM) IST.
 * If current time > cutoff, order is blocked with the exact message:
 * "Orders for this date close at 6:00 PM the previous day."
 */
export const checkPickupCutoff = (pickupDateStr: string): CutoffCheckResult => {
  if (!pickupDateStr || typeof pickupDateStr !== 'string' || !pickupDateStr.trim()) {
    return {
      isValid: false,
      cutoffIST: '',
      nowIST: DateTime.now().setZone(IST_ZONE).toFormat('yyyy-MM-dd HH:mm:ss'),
      reason: 'Delivery/Pickup Date is mandatory before checkout.'
    };
  }

  // Parse pickup date in IST
  const pickupDate = DateTime.fromISO(pickupDateStr.trim(), { zone: IST_ZONE }).startOf('day');
  if (!pickupDate.isValid) {
    return {
      isValid: false,
      cutoffIST: '',
      nowIST: DateTime.now().setZone(IST_ZONE).toFormat('yyyy-MM-dd HH:mm:ss'),
      reason: 'Invalid pickup date format. Expected YYYY-MM-DD.'
    };
  }

  const nowIST = DateTime.now().setZone(IST_ZONE);
  // Cutoff is (pickupDate - 1 day) at 18:00:00.000 IST
  const cutoffIST = pickupDate.minus({ days: 1 }).set({ hour: 18, minute: 0, second: 0, millisecond: 0 });

  if (nowIST > cutoffIST) {
    return {
      isValid: false,
      cutoffIST: cutoffIST.toISO() || '',
      nowIST: nowIST.toFormat('yyyy-MM-dd HH:mm:ss'),
      reason: 'Orders for this date close at 6:00 PM the previous day.'
    };
  }

  return {
    isValid: true,
    cutoffIST: cutoffIST.toISO() || '',
    nowIST: nowIST.toFormat('yyyy-MM-dd HH:mm:ss')
  };
};

/**
 * Server-side price calculation and option validation.
 * Prevents price tampering by resolving all prices from database snapshots.
 */
export const validateAndCalculateOrder = async (
  reqItems: CreateOrderRequest['items']
): Promise<PriceCalculationResult> => {
  if (!Array.isArray(reqItems) || reqItems.length === 0) {
    throw new Error('Order must contain at least 1 item.');
  }

  // Business Rule 6.1: Cart line items limit max 3 distinct items
  if (reqItems.length > 3) {
    throw new Error('Cart limit exceeded: maximum 3 distinct cake line items allowed per order.');
  }

  const calculatedItems: OrderItemSnapshot[] = [];
  let calculatedItemsTotal = 0;

  for (const item of reqItems) {
    if (!item.cakeId) throw new Error('Item missing cakeId.');
    if (!item.qty || item.qty < 1 || !Number.isInteger(item.qty)) {
      throw new Error(`Invalid quantity ${item.qty} for cake item.`);
    }

    const cake: CakeDocument | null = await getCakeById(item.cakeId);
    if (!cake) {
      throw new Error(`Cake with ID "${item.cakeId}" was not found or is unavailable.`);
    }

    // 1. Validate Weight (case-insensitive with fallback)
    const weightObj = cake.weights.find(w => w.key.trim().toLowerCase() === (item.weightKey || '').trim().toLowerCase()) 
      || cake.weights[0];
    const weightKey = weightObj?.key || item.weightKey || '1kg';
    const weightPriceSnapshot = weightObj?.price || 500;

    // 2. Validate Flavour (case-insensitive with fallback)
    const flavourObj = cake.flavours?.find(f => f.key.trim().toLowerCase() === (item.flavourKey || '').trim().toLowerCase())
      || cake.flavours?.[0]
      || { key: 'Original', extra: 0 };
    const flavourKey = flavourObj.key;
    const flavourExtraSnapshot = flavourObj.extra || 0;

    // 3. Validate Toppings
    let toppingsExtraSnapshot = 0;
    const validToppingKeys: string[] = [];
    const toppingKeys = item.toppingKeys || [];
    for (const tKey of toppingKeys) {
      const topObj = cake.toppings?.find(t => t.key.trim().toLowerCase() === tKey.trim().toLowerCase());
      if (topObj) {
        validToppingKeys.push(topObj.key);
        toppingsExtraSnapshot += topObj.extra || 0;
      }
    }

    // 4. Validate Add-ons
    let addOnsExtraSnapshot = 0;
    const validAddOnKeys: string[] = [];
    const addOnKeys = item.addOnKeys || [];
    for (const aKey of addOnKeys) {
      const addObj = cake.addOns?.find(a => a.key.trim().toLowerCase() === aKey.trim().toLowerCase());
      if (addObj) {
        validAddOnKeys.push(addObj.key);
        addOnsExtraSnapshot += addObj.extra || 0;
      }
    }

    // Unit Price = weight + flavour extra + toppings extra + add-ons extra
    const unitPrice = weightPriceSnapshot + flavourExtraSnapshot + toppingsExtraSnapshot + addOnsExtraSnapshot;
    const lineTotal = unitPrice * item.qty;

    calculatedItemsTotal += lineTotal;

    calculatedItems.push({
      cakeId: String(cake._id || cake.id || item.cakeId),
      cakeNameSnapshot: cake.name,
      image: cake.images?.[0] || '',
      weightKey,
      weightPriceSnapshot,
      flavourKey,
      flavourExtraSnapshot,
      toppingKeys: validToppingKeys,
      toppingsExtraSnapshot,
      addOnKeys: validAddOnKeys,
      addOnsExtraSnapshot,
      unitPrice,
      qty: item.qty,
      lineTotal
    });
  }

  const deliveryCharge = await getSettingValue('DELIVERY_CHARGE', 50);
  const totalAmount = calculatedItemsTotal + deliveryCharge;

  return {
    items: calculatedItems,
    itemsTotal: calculatedItemsTotal,
    deliveryCharge,
    totalAmount
  };
};
