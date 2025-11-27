import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import { getOffsetPagination } from '../../utils/pagination.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';

// common include for order
const orderInclude = {
  client: { 
    select: { 
      id: true, 
      firstName: true, 
      surname: true, 
      email: true, 
      phone: true, 
      address: true 
    } 
  },
  orderType: { select: { id: true, orderType: true } },
  pickup: { select: { id: true, pickup: true } },
  items: {
    include: { 
      product: { 
        select: { 
          id: true, 
          name: true, 
          plu: true,
          batches: {
            select: {
              unit: { select: { id: true, unitType: true } }
            },
            take: 1,
            orderBy: { createdAt: 'asc' }
          }
        } 
      } 
    },
  },
  services: { select: { id: true, serviceType: true } },
  documents: { select: { id: true, title: true } },
};

// ==========================================
// CREATE ORDER
// ==========================================
export const createOrder = catchAsync(async (req, res) => {
  const {
    clientId,
    orderTypeId,
    pickupId,
    date,
    comment,
    bill,
    items,
    services,
    documentIds,
  } = req.validated.body;

  const data = {
    clientId,
    orderTypeId,
    pickupId,
    date,
    ...(comment !== undefined && { comment }),
    ...(bill !== undefined && { bill }),
  };

  if (items && items.length) {
    data.items = {
      create: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    };
  }

  if (services && services.length) {
    data.services = { connect: services.map((id) => ({ id })) };
  }

  if (documentIds && documentIds.length) {
    data.documents = { connect: documentIds.map((id) => ({ id })) };
  }

  const order = await prisma.order.create({ data, include: orderInclude });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Order created successfully',
    data: order,
  });
});

// ==========================================
// UPDATE ORDER
// ==========================================
export const updateOrder = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const { items, services, documentIds, ...orderData } = req.validated.body;

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) throw new ApiError('Order not found', StatusCodes.NOT_FOUND);

  // Update main fields
  await prisma.order.update({ where: { id }, data: orderData });

  if (items && Array.isArray(items)) {
    const passedItemIds = items
      .filter((it) => it.id)
      .map((it) => Number(it.id));
    const existingItemIds = existing.items.map((it) => it.id);

    // delete items not passed
    const itemsToDelete = existingItemIds.filter(
      (iid) => !passedItemIds.includes(iid)
    );
    if (itemsToDelete.length) {
      await prisma.orderItem.deleteMany({
        where: { id: { in: itemsToDelete } },
      });
    }

    // update or create
    await Promise.all(
      items.map(async (it) => {
        if (it.id) {
          await prisma.orderItem.update({
            where: { id: Number(it.id) },
            data: { quantity: it.quantity, productId: it.productId },
          });
        } else {
          await prisma.orderItem.create({
            data: {
              productId: it.productId,
              quantity: it.quantity,
              orderId: id,
            },
          });
        }
      })
    );
  }

  if (services) {
    // replace services
    await prisma.order.update({
      where: { id },
      data: { services: { set: services.map((s) => ({ id: s })) } },
    });
  }

  if (documentIds) {
    await prisma.order.update({
      where: { id },
      data: { documents: { set: documentIds.map((d) => ({ id: d })) } },
    });
  }

  const updated = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Order updated successfully',
    data: updated,
  });
});

// ==========================================
// DELETE ORDER
// ==========================================
export const deleteOrder = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw new ApiError('Order not found', StatusCodes.NOT_FOUND);

  await prisma.order.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Order deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL ORDERS (page-based pagination)
// ==========================================
export const getAllOrders = catchAsync(async (req, res) => {
  const { skip, limit, page } = getOffsetPagination(req.query);

  const where = {};

  const { pickupId, orderTypeId, serviceId, clientId, search, date } = req.validated.query;

  // Search by comment OR order ID
  if (search) {
    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      // If search is a number, search by ID or comment
      where.OR = [
        { id: searchNum },
        { comment: { contains: search, mode: 'insensitive' } },
      ];
    } else {
      // If search is text, only search comment
      where.comment = { contains: search, mode: 'insensitive' };
    }
  }

  // Date filter - show orders from selected date onwards
  if (date) {
    const selectedDate = new Date(date);
    if (!isNaN(selectedDate)) {
      where.date = {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
      };
    }
  }

  // Filter by client
  if (clientId) where.clientId = Number(clientId);
  if (pickupId) where.pickupId = Number(pickupId);
  if (orderTypeId) where.orderTypeId = Number(orderTypeId);
  if (serviceId) where.services = { some: { id: Number(serviceId) } };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const nextPage = page * limit < total ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Orders retrieved successfully',
    data: {
      records: orders,
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
// GET ORDER BY ID
// ==========================================
export const getOrderById = catchAsync(async (req, res) => {
  const id = Number(req.validated.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  if (!order) throw new ApiError('Order not found', StatusCodes.NOT_FOUND);
  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Order retrieved successfully',
    data: order,
  });
});
