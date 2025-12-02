import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import successResponse from '../../utils/success.response.js';

// ==========================================
// CREATE REFILL(S)
// ==========================================
export const createRefill = catchAsync(async (req, res) => {
  const { siteId, refills } = req.validated.body;

  // Verify site exists
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) {
    throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
  }

  // Create multiple refills
  const createdRefills = await prisma.refill.createMany({
    data: refills.map((refill) => ({
      siteId,
      productId: refill.productId,
      quantity: refill.quantity,
    })),
  });

  // Fetch created refills with product details
  const refillsWithProducts = await prisma.refill.findMany({
    where: { siteId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          plu: true,
          batches: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Refills created successfully',
    data: refillsWithProducts,
  });
});

// ==========================================
// UPDATE REFILL
// ==========================================
export const updateRefill = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { quantity } = req.validated.body;

  const existing = await prisma.refill.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Refill not found', StatusCodes.NOT_FOUND);
  }

  const updatedRefill = await prisma.refill.update({
    where: { id },
    data: { quantity },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          plu: true,
          batches: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Refill updated successfully',
    data: updatedRefill,
  });
});

// ==========================================
// DELETE REFILL
// ==========================================
export const deleteRefill = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.refill.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Refill not found', StatusCodes.NOT_FOUND);
  }

  await prisma.refill.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Refill deleted successfully',
    data: null,
  });
});
