import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import { logConsole } from '../../utils/log.console.js';
import { getOffsetPagination } from '../../utils/pagination.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';

// ==========================================
// CREATE PRODUCT (with optional batches)
// ==========================================
export const createProduct = catchAsync(async (req, res) => {
  const { batches, documentIds, ...productData } = req.validated.body;

  const data = { ...productData };

  // ------------------------------
  // Attach related documents
  // ------------------------------
  if (documentIds?.length) {
    data.document = {
      connect: documentIds.map((id) => ({ id })),
    };
  }

  // ------------------------------
  // Handle batch creation
  // ------------------------------
  if (batches?.length) {
    data.batches = {
      create: batches.map((b) => ({
        quantity: b.quantity,
        dlc: b.dlc,
        deliveryTemp: b.deliveryTemp,
        unitId: b.unitId,
        supplierId: b.supplierId,
      })),
    };
  }

  // ------------------------------
  // Calculate restock
  // ------------------------------
  const totalBatchQty =
    batches?.reduce((sum, b) => sum + Number(b.quantity || 0), 0) || 0;

  data.restock = totalBatchQty <= Number(productData.criticalQuantity);

  const product = await prisma.product.create({
    data,
    include: {
      batches: {
        include: {
          supplier: { select: { name: true, email: true } },
          unit: true,
        },
      },
      document: true,
      department: true,
    },
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Product created successfully',
    data: product,
  });
});

// ==========================================
// UPDATE PRODUCT (batches + documents sync)
// ==========================================
export const updateProduct = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { batches, documentIds, ...productData } = req.validated.body;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: {
      batches: true,
      document: true,
      department: true,
    },
  });

  if (!existing) {
    throw new ApiError('Product not found', StatusCodes.NOT_FOUND);
  }

  // ---------------------------------------
  // STEP 1 – Update main product fields
  // ---------------------------------------
  await prisma.product.update({
    where: { id },
    data: productData,
  });

  // ---------------------------------------
  // STEP 2 – Sync Documents
  // ---------------------------------------
  if (documentIds) {
    const existingDocIds = existing.document.map((d) => d.id);

    const toConnect = documentIds
      .filter((id) => !existingDocIds.includes(id))
      .map((id) => ({ id }));

    const toDisconnect = existingDocIds
      .filter((id) => !documentIds.includes(id))
      .map((id) => ({ id }));

    await prisma.product.update({
      where: { id },
      data: {
        document: {
          connect: toConnect,
          disconnect: toDisconnect,
        },
      },
    });
  }

  // ---------------------------------------
  // STEP 3 – Sync Batches
  // ---------------------------------------
  if (Array.isArray(batches)) {
    const existingBatchIds = existing.batches.map((b) => b.id);
    const passedBatchIds = batches.filter((b) => b.id).map((b) => Number(b.id));

    // Delete removed batches
    const toDelete = existingBatchIds.filter(
      (batchId) => !passedBatchIds.includes(batchId)
    );
    if (toDelete.length) {
      await prisma.productBatch.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // Update or create batches
    await Promise.all(
      batches.map(async (b) => {
        if (b.id) {
          // update
          return prisma.productBatch.update({
            where: { id: Number(b.id) },
            data: {
              quantity: b.quantity,
              dlc: b.dlc,
              deliveryTemp: b.deliveryTemp,
              unitId: b.unitId,
              supplierId: b.supplierId,
            },
          });
        } else {
          // create
          return prisma.productBatch.create({
            data: {
              plu: b.plu,
              quantity: b.quantity,
              dlc: b.dlc,
              deliveryTemp: b.deliveryTemp,
              unitId: b.unitId,
              supplierId: b.supplierId,
              productId: id,
            },
          });
        }
      })
    );
  }

  // ---------------------------------------
  // STEP 4 – Recalculate restock
  // ---------------------------------------
  const sumAfter = await prisma.productBatch.aggregate({
    where: { productId: id },
    _sum: { quantity: true },
  });

  const totalAfter = sumAfter._sum.quantity || 0;
  const criticalQty = productData.criticalQuantity ?? existing.criticalQuantity;

  await prisma.product.update({
    where: { id },
    data: { restock: totalAfter <= Number(criticalQty) },
  });

  // ---------------------------------------
  // STEP 5 – Return updated product
  // ---------------------------------------
  const updated = await prisma.product.findUnique({
    where: { id },
    include: {
      batches: {
        include: {
          supplier: { select: { name: true, email: true } },
          unit: true,
        },
      },
      document: true,
      department: true,
    },
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Product updated successfully',
    data: updated,
  });
});

// ==========================================
// DELETE PRODUCT
// ==========================================
export const deleteProduct = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError('Product not found', StatusCodes.NOT_FOUND);

  await prisma.product.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Product deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getAllProducts = catchAsync(async (req, res) => {
  const { skip, limit, page } = getOffsetPagination(req.validated.query);
  const { search, supplierId } = req.validated.query;

  // Build filters
  const filters = {};

  // Search by id, plu, or name
  if (search) {
    const searchTerm = search.trim();
    const numericSearch = parseInt(searchTerm);

    filters.OR = [{ name: { contains: searchTerm, mode: 'insensitive' } }];

    // Add numeric searches if the search term is a valid number
    if (!isNaN(numericSearch)) {
      filters.OR.push({ id: numericSearch }, { plu: numericSearch });
    }
  }

  // Filter by supplier
  if (supplierId) {
    filters.batches = {
      some: {
        supplierId: parseInt(supplierId),
      },
    };
  }

  const orderBy = getSortOrder(req.validated.query, 'createdAt');

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: filters,
      orderBy,
      skip,
      take: limit,
      include: {
        batches: {
          include: {
            supplier: { select: { name: true, email: true } },
            unit: true,
          },
        },
        document: true,
        department: true,
      },
    }),
    prisma.product.count({ where: filters }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const nextPage = page * limit < total ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: {
      records: products,
      pagination: {
        total_records: total,
        current_page: page,
        total_pages: totalPages,
        limit,
        next_page: nextPage,
        prev_page: prevPage,
      },
    },
  });
});

// ==========================================
// GET SINGLE PRODUCT
// ==========================================
export const getProduct = catchAsync(async (req, res) => {
  const id = req.params.id;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      batches: {
        include: {
          supplier: { select: { name: true, email: true } },
          unit: true,
        },
      },
    },
  });
  if (!product) throw new ApiError('Product not found', StatusCodes.NOT_FOUND);

  return successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: product,
  });
});
