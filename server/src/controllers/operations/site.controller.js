import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import successResponse from '../../utils/success.response.js';

const siteInclude = {
  refills: {
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
  },
};

// ==========================================
// CREATE SITE
// ==========================================
export const createSite = catchAsync(async (req, res) => {
  const { siteName, day, supervisor } = req.validated.body;

  const site = await prisma.site.create({
    data: {
      siteName,
      day,
      supervisor,
    },
    include: siteInclude,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Site created successfully',
    data: site,
  });
});

// ==========================================
// UPDATE SITE
// ==========================================
export const updateSite = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { siteName, day, supervisor } = req.validated.body;

  const existing = await prisma.site.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
  }

  const data = {};
  if (siteName !== undefined) data.siteName = siteName;
  if (day !== undefined) data.day = day;
  if (supervisor !== undefined) data.supervisor = supervisor;

  const updatedSite = await prisma.site.update({
    where: { id },
    data,
    include: siteInclude,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Site updated successfully',
    data: updatedSite,
  });
});

// ==========================================
// DELETE SITE
// ==========================================
export const deleteSite = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.site.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
  }

  await prisma.site.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Site deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL SITES
// ==========================================
export const getAllSites = catchAsync(async (req, res) => {
  const { day, supervisor, search } = req.validated.query;

  const where = {};

  if (day) {
    where.day = day;
  }

  if (supervisor) {
    where.supervisor = { contains: supervisor, mode: 'insensitive' };
  }

  if (search) {
    where.siteName = { contains: search, mode: 'insensitive' };
  }

  const sites = await prisma.site.findMany({
    where,
    include: siteInclude,
    orderBy: [{ day: 'asc' }, { siteName: 'asc' }],
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Sites retrieved successfully',
    data: {
      records: sites,
    },
  });
});

// ==========================================
// GET SITE BY ID
// ==========================================
export const getSiteById = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const site = await prisma.site.findUnique({
    where: { id },
    include: siteInclude,
  });

  if (!site) {
    throw new ApiError('Site not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Site retrieved successfully',
    data: site,
  });
});
