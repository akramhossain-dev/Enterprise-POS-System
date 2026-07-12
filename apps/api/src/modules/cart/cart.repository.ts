import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export type PrismaCartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: { select: { name: true; sku: true; barcode: true } };
      };
    };
  };
}>;

export async function findCartById(id: string): Promise<PrismaCartWithItems | null> {
  return prisma.cart.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, sku: true, barcode: true } },
        },
      },
    },
  });
}

export async function createCart(
  tx: Prisma.TransactionClient,
  data: {
    sessionId: string;
    customerId?: string | null;
  },
): Promise<PrismaCartWithItems> {
  const cart = await tx.cart.create({
    data: {
      sessionId: data.sessionId,
      customerId: data.customerId ?? null,
      status: 'ACTIVE',
      subtotal: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      tax: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
    },
  });

  return tx.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, sku: true, barcode: true } },
        },
      },
    },
  });
}

export async function updateCartTotals(
  cartId: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const items = await tx.cartItem.findMany({
    where: { cartId },
  });

  let subtotal = new Prisma.Decimal(0);
  let discount = new Prisma.Decimal(0);
  let tax = new Prisma.Decimal(0);
  let grandTotal = new Prisma.Decimal(0);

  for (const item of items) {
    const itemSubtotal = item.quantity.mul(item.unitPrice);
    subtotal = subtotal.add(itemSubtotal);
    discount = discount.add(item.discount);
    tax = tax.add(item.tax);
    grandTotal = grandTotal.add(item.total);
  }

  await tx.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      discount,
      tax,
      grandTotal,
    },
  });
}

export async function addOrUpdateItem(
  tx: Prisma.TransactionClient,
  data: {
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
  },
): Promise<void> {
  // Check if item already exists in cart
  const existing = await tx.cartItem.findFirst({
    where: {
      cartId: data.cartId,
      productId: data.productId,
    },
  });

  const quantityDec = new Prisma.Decimal(data.quantity);
  const priceDec = new Prisma.Decimal(data.unitPrice);
  const discountDec = new Prisma.Decimal(data.discount);
  const taxDec = new Prisma.Decimal(data.tax);

  // total = (quantity * unitPrice) - discount + tax
  const subtotalDec = quantityDec.mul(priceDec);
  const totalDec = subtotalDec.sub(discountDec).add(taxDec);

  if (existing) {
    const newQty = existing.quantity.add(quantityDec);
    // If updating existing, total discount and tax should scale or we can add them.
    // To make it simple and predictable: we scale discount and tax proportionally if they were default unit discounts,
    // or we just sum them. Let's recalculate based on unit discount or treat discount/tax as absolute total values.
    // If they were provided as parameters, we treat them as absolute totals.
    // But since quantity is incremented, let's update:
    const newSubtotal = newQty.mul(priceDec);
    // Scale discount and tax proportionally to new quantity:
    const ratio = newQty.div(existing.quantity);
    const newDiscount = existing.discount.mul(ratio);
    const newTax = existing.tax.mul(ratio);
    const newTotal = newSubtotal.sub(newDiscount).add(newTax);

    await tx.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: newQty,
        unitPrice: priceDec,
        discount: newDiscount,
        tax: newTax,
        total: newTotal,
      },
    });
  } else {
    await tx.cartItem.create({
      data: {
        cartId: data.cartId,
        productId: data.productId,
        quantity: quantityDec,
        unitPrice: priceDec,
        discount: discountDec,
        tax: taxDec,
        total: totalDec,
      },
    });
  }

  await updateCartTotals(data.cartId, tx);
}

export async function updateItem(
  tx: Prisma.TransactionClient,
  itemId: string,
  cartId: string,
  data: {
    quantity: number;
    unitPrice?: number | undefined;
    discount?: number | undefined;
    tax?: number | undefined;
  },
): Promise<void> {
  const existing = await tx.cartItem.findUniqueOrThrow({
    where: { id: itemId },
  });

  const quantityDec = new Prisma.Decimal(data.quantity);
  const priceDec =
    data.unitPrice !== undefined ? new Prisma.Decimal(data.unitPrice) : existing.unitPrice;
  const discountDec =
    data.discount !== undefined ? new Prisma.Decimal(data.discount) : existing.discount;
  const taxDec = data.tax !== undefined ? new Prisma.Decimal(data.tax) : existing.tax;

  const subtotalDec = quantityDec.mul(priceDec);
  const totalDec = subtotalDec.sub(discountDec).add(taxDec);

  await tx.cartItem.update({
    where: { id: itemId },
    data: {
      quantity: quantityDec,
      unitPrice: priceDec,
      discount: discountDec,
      tax: taxDec,
      total: totalDec,
    },
  });

  await updateCartTotals(cartId, tx);
}

export async function removeItem(
  tx: Prisma.TransactionClient,
  itemId: string,
  cartId: string,
): Promise<void> {
  await tx.cartItem.delete({
    where: { id: itemId },
  });

  await updateCartTotals(cartId, tx);
}

export async function clearCartItems(tx: Prisma.TransactionClient, cartId: string): Promise<void> {
  await tx.cartItem.deleteMany({
    where: { cartId },
  });

  await tx.cart.update({
    where: { id: cartId },
    data: {
      subtotal: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      tax: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
    },
  });
}
