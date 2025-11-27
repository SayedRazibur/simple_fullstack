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
// CREATE CLIENT
// ==========================================
export const createClient = catchAsync(async (req, res) => {
  const { firstName, surname, address, email, phone } = req.validated.body;

  const existing = await prisma.client.findFirst({ where: { email } });
  logConsole(existing);
  if (existing) {
    throw new ApiError(
      'Client with this email already exists',
      StatusCodes.CONFLICT
    );
  }

  const client = await prisma.client.create({
    data: { firstName, surname, address, email, phone },
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Client created successfully',
    data: client,
  });
});

// ==========================================
// UPDATE CLIENT
// ==========================================
export const updateClient = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) throw new ApiError('Client not found', StatusCodes.NOT_FOUND);

  const updated = await prisma.client.update({
    where: { id },
    data: req.validated.body,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Client updated successfully',
    data: updated,
  });
});

// ==========================================
// DELETE CLIENT
// ==========================================
export const deleteClient = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) throw new ApiError('Client not found', StatusCodes.NOT_FOUND);

  await prisma.client.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Client deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL CLIENTS
// ==========================================
export const getAllClients = catchAsync(async (req, res) => {
  const { skip, limit, page } = getOffsetPagination(req.validated.query);

  const filters = getSearchFilters(req.validated.query, [
    'firstName',
    'surname',
    'email',
    'phone',
  ]);
  const orderBy = getSortOrder(req.validated.query, 'firstName');

  const [clients, total] = await prisma.$transaction([
    prisma.client.findMany({
      where: filters,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.client.count({ where: filters }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const nextPage = page * limit < total ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Clients retrieved successfully',
    data: {
      records: clients,
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
