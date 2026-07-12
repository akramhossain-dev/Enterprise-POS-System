import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { prisma } from '../../lib/prisma';
import {
  findCartById,
  createCart,
  addOrUpdateItem,
  updateItem,
  removeItem,
  clearCartItems,
  PrismaCartWithItems,
} from './cart.repository';
import { AddCartItemBody, UpdateCartItemBody } from './cart.schema';

export interface MappedCartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  sku: string | null;
  barcode: string | null;
  quantity: string;
  unitPrice: string;
  discount: string;
  tax: string;
  total: string;
  createdAt: string;
}

export interface MappedCart {
  id: string;
  sessionId: string;
  customerId: string | null;
  status: string;
  subtotal: string;
  discount: string;
  tax: string;
  grandTotal: string;
  createdAt: string;
  updatedAt: string;
  items: MappedCartItem[];
}

export function mapCart(cart: PrismaCartWithItems): MappedCart {
  return {
    id: cart.id,
    sessionId: cart.sessionId,
    customerId: cart.customerId,
    status: cart.status,
    subtotal: cart.subtotal.toString(),
    discount: cart.discount.toString(),
    tax: cart.tax.toString(),
    grandTotal: cart.grandTotal.toString(),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      barcode: item.product.barcode,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
      tax: item.tax.toString(),
      total: item.total.toString(),
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

async function validateSessionOwnership(sessionId: string, cashierId: string) {
  const session = await prisma.pOSSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new NotFoundError(`POS Session with ID "${sessionId}" not found`);
  }
  if (session.status !== 'OPEN') {
    throw new BadRequestError('POS Session is not active');
  }
  if (session.cashierId !== cashierId) {
    throw new ForbiddenError('You do not have permission to access this POS Session');
  }
  return session;
}

async function validateCartAndSession(cartId: string, cashierId: string) {
  const cart = await findCartById(cartId);
  if (!cart) {
    throw new NotFoundError(`Cart with ID "${cartId}" not found`);
  }
  const session = await prisma.pOSSession.findUnique({
    where: { id: cart.sessionId },
  });
  if (!session) {
    throw new ForbiddenError('Access to this cart is not authorized or session is inactive');
  }
  if (session.status !== 'OPEN' || session.cashierId !== cashierId) {
    throw new ForbiddenError('Access to this cart is not authorized or session is inactive');
  }
  return { cart, session };
}

export async function createNewCart(
  sessionId: string,
  customerId: string | null | undefined,
  cashierId: string,
): Promise<MappedCart> {
  await validateSessionOwnership(sessionId, cashierId);

  const cart = await prisma.$transaction(async (tx) => {
    return createCart(tx, { sessionId, customerId: customerId ?? null });
  });

  console.warn(`[AUDIT] Cart Created: ${cart.id}`);
  return mapCart(cart);
}

export async function getCartById(id: string, cashierId: string): Promise<MappedCart> {
  const { cart } = await validateCartAndSession(id, cashierId);
  return mapCart(cart);
}

export async function addCartProduct(
  cartId: string,
  body: AddCartItemBody,
  cashierId: string,
): Promise<MappedCart> {
  const { session } = await validateCartAndSession(cartId, cashierId);

  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });
  if (product?.status !== 'ACTIVE') {
    throw new NotFoundError(`Active Product with ID "${body.productId}" not found`);
  }

  // Validate stock
  const inv = await prisma.inventory.findFirst({
    where: {
      warehouseId: session.warehouseId,
      productId: body.productId,
    },
  });
  const available = Number(inv?.availableQuantity ?? 0);
  if (available < body.quantity) {
    throw new BadRequestError(
      `Insufficient stock to add product "${product.name}" to cart. Available: ${available.toString()}, Requested: ${body.quantity.toString()}`,
    );
  }

  const unitPrice = body.unitPrice ?? Number(product.sellingPrice);
  const discount = body.discount ?? 0;
  const tax = body.tax ?? 0;

  await prisma.$transaction(async (tx) => {
    await addOrUpdateItem(tx, {
      cartId,
      productId: body.productId,
      quantity: body.quantity,
      unitPrice,
      discount,
      tax,
    });
  });

  const updatedCart = await findCartById(cartId);
  if (!updatedCart) {
    throw new NotFoundError(`Cart with ID "${cartId}" not found`);
  }
  console.warn(`[AUDIT] Cart Updated: ${cartId} (Item added/updated)`);
  return mapCart(updatedCart);
}

export async function updateCartProduct(
  cartId: string,
  itemId: string,
  body: UpdateCartItemBody,
  cashierId: string,
): Promise<MappedCart> {
  const { session } = await validateCartAndSession(cartId, cashierId);

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });
  if (item?.cartId !== cartId) {
    throw new NotFoundError(`Cart Item with ID "${itemId}" not found in this cart`);
  }

  // Validate stock
  const inv = await prisma.inventory.findFirst({
    where: {
      warehouseId: session.warehouseId,
      productId: item.productId,
    },
  });
  const available = Number(inv?.availableQuantity ?? 0);
  if (available < body.quantity) {
    throw new BadRequestError(
      `Insufficient stock to update product to quantity ${body.quantity.toString()}. Available: ${available.toString()}`,
    );
  }

  await prisma.$transaction(async (tx) => {
    await updateItem(tx, itemId, cartId, body);
  });

  const updatedCart = await findCartById(cartId);
  if (!updatedCart) {
    throw new NotFoundError(`Cart with ID "${cartId}" not found`);
  }
  console.warn(`[AUDIT] Cart Updated: ${cartId} (Item quantity/price updated)`);
  return mapCart(updatedCart);
}

export async function removeCartProduct(
  cartId: string,
  itemId: string,
  cashierId: string,
): Promise<MappedCart> {
  await validateCartAndSession(cartId, cashierId);

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });
  if (item?.cartId !== cartId) {
    throw new NotFoundError(`Cart Item with ID "${itemId}" not found in this cart`);
  }

  await prisma.$transaction(async (tx) => {
    await removeItem(tx, itemId, cartId);
  });

  const updatedCart = await findCartById(cartId);
  if (!updatedCart) {
    throw new NotFoundError(`Cart with ID "${cartId}" not found`);
  }
  console.warn(`[AUDIT] Cart Updated: ${cartId} (Item removed)`);
  return mapCart(updatedCart);
}

export async function clearCartProducts(cartId: string, cashierId: string): Promise<MappedCart> {
  await validateCartAndSession(cartId, cashierId);

  await prisma.$transaction(async (tx) => {
    await clearCartItems(tx, cartId);
  });

  const updatedCart = await findCartById(cartId);
  if (!updatedCart) {
    throw new NotFoundError(`Cart with ID "${cartId}" not found`);
  }
  console.warn(`[AUDIT] Cart Updated: ${cartId} (Cart cleared)`);
  return mapCart(updatedCart);
}
