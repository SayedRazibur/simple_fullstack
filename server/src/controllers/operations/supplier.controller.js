// controllers/supplier.controller.js
import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import { logConsole } from '../../utils/log.console.js';
import { getOffsetPagination } from '../../utils/pagination.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';

// ============================================================
// CREATE SUPPLIER
// ============================================================
export const createSupplier = catchAsync(async (req, res) => {
  const { name, email, phone, contactMethod } = req.validated.body;

  const existing = await prisma.supplier.findFirst({ where: { email } });
  logConsole(existing);
  if (existing) {
    throw new ApiError(
      'Supplier with this email already exists',
      StatusCodes.CONFLICT
    );
  }

  const supplier = await prisma.supplier.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      contactMethod: contactMethod || null,
    },
    include: {
      batches: true,
      purchase: true,
    },
  });

  return successResponse({
    res,
    code: StatusCodes.CREATED,
    success: true,
    message: 'Supplier created successfully',
    data: supplier,
  });
});

// ============================================================
// UPDATE SUPPLIER
// ============================================================
export const updateSupplier = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { email } = req.validated.body;

  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Supplier not found', StatusCodes.NOT_FOUND);
  }

  // 🔥 Check email duplication only when email is provided
  if (email && email !== existing.email) {
    const duplicate = await prisma.supplier.findUnique({ where: { email } });
    if (duplicate) {
      throw new ApiError(
        'Another supplier already uses this email',
        StatusCodes.CONFLICT
      );
    }
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: req.validated.body,
    include: {
      batches: true,
      purchase: true,
    },
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Supplier updated successfully',
    data: updated,
  });
});

// ============================================================
// DELETE SUPPLIER
// ============================================================
export const deleteSupplier = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Supplier not found', StatusCodes.NOT_FOUND);
  }

  await prisma.supplier.delete({ where: { id } });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Supplier deleted successfully',
    data: null,
  });
});

// ============================================================
// GET ALL SUPPLIERS
// ============================================================
export const getAllSuppliers = catchAsync(async (req, res) => {
  const { skip, limit, page } = getOffsetPagination(req.validated.query);

  const filters = getSearchFilters(req.validated.query, [
    'name',
    'email',
    'phone',
  ]);

  const orderBy = getSortOrder(req.validated.query, 'name');

  const [suppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where: filters,
      orderBy,
      skip,
      take: limit,
      include: {
        batches: true,
        purchase: true,
      },
    }),
    prisma.supplier.count({ where: filters }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const nextPage = page * limit < total ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Suppliers retrieved successfully',
    data: {
      records: suppliers,
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
