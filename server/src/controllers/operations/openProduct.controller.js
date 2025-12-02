import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import successResponse from '../../utils/success.response.js';

const openProductInclude = {
  site: {
    select: {
      id: true,
      siteName: true,
      day: true,
      supervisor: true,
    },
  },
  products: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          plu: true,
        },
      },
    },
  },
  document: {
    select: {
      id: true,
      title: true,
      links: true,
      importedOn: true,
    },
  },
};

// ==========================================
// CREATE OPEN PRODUCT
// ==========================================
export const createOpenProduct = catchAsync(async (req, res) => {
  const { siteId, documentId, products } = req.validated.body;

  // Verify site exists
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) {
    throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
  }

  // Create OpenProduct with OpenProductItems
  const openProduct = await prisma.openProduct.create({
    data: {
      siteId,
      documentId,
      products: {
        create: products.map((product) => ({
          productId: product.productId,
        })),
      },
    },
    include: openProductInclude,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Open product created successfully',
    data: openProduct,
  });
});

// ==========================================
// UPDATE OPEN PRODUCT
// ==========================================
export const updateOpenProduct = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { siteId, documentId, products } = req.validated.body;

  const existing = await prisma.openProduct.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Open product not found', StatusCodes.NOT_FOUND);
  }

  // Verify site exists if provided
  if (siteId) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
    }
  }

  // Update OpenProduct with new products
  const openProduct = await prisma.openProduct.update({
    where: { id },
    data: {
      ...(siteId && { siteId }),
      ...(documentId && { documentId }),
      ...(products && {
        products: {
          deleteMany: {}, // Delete all existing products
          create: products.map((product) => ({
            productId: product.productId,
          })),
        },
      }),
    },
    include: openProductInclude,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Open product updated successfully',
    data: openProduct,
  });
});

// ==========================================
// DELETE OPEN PRODUCT
// ==========================================
export const deleteOpenProduct = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.openProduct.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Open product not found', StatusCodes.NOT_FOUND);
  }

  await prisma.openProduct.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Open product deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL OPEN PRODUCTS
// ==========================================
export const getAllOpenProducts = catchAsync(async (req, res) => {
  const { siteId, date } = req.validated.query;

  const where = {};

  if (siteId) {
    where.siteId = siteId;
  }

  if (date) {
    const startDate = new Date(date);

    where.createdAt = {
      gte: startDate,
    };
  }

  const openProducts = await prisma.openProduct.findMany({
    where,
    include: openProductInclude,
    orderBy: { createdAt: 'desc' },
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Open products retrieved successfully',
    data: {
      records: openProducts,
    },
  });
});

// ==========================================
// GET OPEN PRODUCT BY ID
// ==========================================
export const getOpenProductById = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const openProduct = await prisma.openProduct.findUnique({
    where: { id },
    include: openProductInclude,
  });

  if (!openProduct) {
    throw new ApiError('Open product not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Open product retrieved successfully',
    data: openProduct,
  });
});
