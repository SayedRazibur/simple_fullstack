import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import successResponse from '../../utils/success.response.js';

const purchaseInclude = {
  pickup: { select: { id: true, pickup: true } },
  supplier: { select: { id: true, name: true, email: true } },
  items: {
    include: { product: { select: { id: true, name: true, plu: true } } },
  },
};

// CREATE PURCHASE
export const createPurchase = catchAsync(async (req, res) => {
  const { pickupId, supplierId, date, items } = req.validated.body;

  const data = { pickupId, supplierId, date };
  if (items && items.length) {
    data.items = {
      create: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    };
  }

  const purchase = await prisma.purchase.create({
    data,
    include: purchaseInclude,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Purchase created successfully',
    data: purchase,
  });
});

// UPDATE PURCHASE
export const updatePurchase = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const { items, ...purchaseData } = req.validated.body;

  const existing = await prisma.purchase.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing)
    throw new ApiError('Purchase not found', StatusCodes.NOT_FOUND);

  await prisma.purchase.update({ where: { id }, data: purchaseData });

  if (items && Array.isArray(items)) {
    const passedIds = items.filter((i) => i.id).map((i) => Number(i.id));
    const existingIds = existing.items.map((it) => it.id);

    const toDelete = existingIds.filter((eid) => !passedIds.includes(eid));
    if (toDelete.length) {
      await prisma.purchaseItem.deleteMany({ where: { id: { in: toDelete } } });
    }

    await Promise.all(
      items.map(async (it) => {
        if (it.id) {
          await prisma.purchaseItem.update({
            where: { id: Number(it.id) },
            data: { quantity: it.quantity, productId: it.productId },
          });
        } else {
          await prisma.purchaseItem.create({
            data: {
              productId: it.productId,
              quantity: it.quantity,
              purchaseId: id,
            },
          });
        }
      })
    );
  }

  const updated = await prisma.purchase.findUnique({
    where: { id },
    include: purchaseInclude,
  });
  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Purchase updated successfully',
    data: updated,
  });
});

// DELETE PURCHASE
export const deletePurchase = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const existing = await prisma.purchase.findUnique({ where: { id } });
  if (!existing)
    throw new ApiError('Purchase not found', StatusCodes.NOT_FOUND);

  await prisma.purchase.delete({ where: { id } });
  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Purchase deleted successfully',
    data: null,
  });
});

// GET ALL PURCHASES (cursor-based)
export const getAllPurchases = catchAsync(async (req, res) => {
  const { limit, cursor, pickupId, supplierId, sortBy, order } =
    req.validated.query;

  const where = getSearchFilters(req.validated.query, []);
  if (pickupId) where.pickupId = Number(pickupId);
  if (supplierId) where.supplierId = Number(supplierId);

  if (cursor) where.date = { gt: cursor };

  const primaryOrder = (() => {
    const ord = order === 'desc' ? 'desc' : 'asc';
    if (sortBy === 'pickup') return { pickup: { pickup: ord } };
    if (sortBy === 'supplier') return { supplier: { name: ord } };
    return { date: ord };
  })();

  const purchases = await prisma.purchase.findMany({
    where,
    include: purchaseInclude,
    orderBy: [primaryOrder, { id: 'asc' }],
    take: limit + 1,
  });

  const hasMore = purchases.length > limit;
  const records = hasMore ? purchases.slice(0, limit) : purchases;
  const nextCursor =
    hasMore && records.length ? records[records.length - 1].date : null;

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Purchases retrieved successfully',
    data: {
      records,
      pageInfo: { cursor: cursor ? cursor : null, nextCursor, limit, hasMore },
    },
  });
});

// GET PURCHASE BY ID
export const getPurchaseById = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: purchaseInclude,
  });
  if (!purchase)
    throw new ApiError('Purchase not found', StatusCodes.NOT_FOUND);
  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Purchase retrieved successfully',
    data: purchase,
  });
});
