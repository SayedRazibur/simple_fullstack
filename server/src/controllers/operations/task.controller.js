import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';

const taskInclude = {
  product: {
    select: {
      id: true,
      name: true,
      plu: true,
    },
  },
  order: {
    select: {
      id: true,
      date: true,
    },
  },
  entity: {
    select: {
      id: true,
      name: true,
    },
  },
  document: {
    select: {
      id: true,
      title: true,
      links: true,
    },
  },
};

// ==========================================
// CREATE TASK
// ==========================================
export const createTask = catchAsync(async (req, res) => {
  const {
    title,
    comment,
    quantity,
    day,
    date,
    productId,
    orderId,
    entityId,
    documentId,
  } = req.validated.body;

  const data = {
    title,
    quantity,
    ...(comment !== undefined && { comment }),
    ...(day !== undefined && { day }),
    ...(date !== undefined && { date }),
  };

  if (productId) {
    data.product = { connect: { id: productId } };
  }

  if (orderId) {
    data.order = { connect: { id: orderId } };
  }

  if (entityId) {
    data.entity = { connect: { id: entityId } };
  }

  if (documentId) {
    data.document = { connect: { id: documentId } };
  }

  const task = await prisma.task.create({
    data,
    include: taskInclude,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Task created successfully',
    data: task,
  });
});

// ==========================================
// UPDATE TASK
// ==========================================
export const updateTask = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const {
    title,
    comment,
    quantity,
    day,
    date,
    productId,
    orderId,
    entityId,
    documentId,
  } = req.validated.body;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Task not found', StatusCodes.NOT_FOUND);
  }

  const data = {};

  if (title !== undefined) data.title = title;
  if (comment !== undefined) data.comment = comment;
  if (quantity !== undefined) data.quantity = quantity;
  if (day !== undefined) data.day = day;
  if (date !== undefined) data.date = date;

  if (productId !== undefined) {
    data.product = productId
      ? { connect: { id: productId } }
      : { disconnect: true };
  }

  if (orderId !== undefined) {
    data.order = orderId ? { connect: { id: orderId } } : { disconnect: true };
  }

  if (entityId !== undefined) {
    data.entity = entityId
      ? { connect: { id: entityId } }
      : { disconnect: true };
  }

  if (documentId !== undefined) {
    data.document = documentId
      ? { connect: { id: documentId } }
      : { disconnect: true };
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data,
    include: taskInclude,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

// ==========================================
// DELETE TASK
// ==========================================
export const deleteTask = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Task not found', StatusCodes.NOT_FOUND);
  }

  await prisma.task.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Task deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL TASKS (cursor-based pagination)
// ==========================================
export const getAllTasks = catchAsync(async (req, res) => {
  const { limit, cursor, entityId, productId, orderId, documentId, day, date } =
    req.validated.query;

  const where = getSearchFilters(req.validated.query, ['title', 'comment']);

  if (cursor) {
    where.date = { gt: cursor };
  }

  if (entityId) {
    where.entityId = entityId;
  }

  if (productId) {
    where.productId = productId;
  }

  if (orderId) {
    where.orderId = orderId;
  }

  if (documentId) {
    where.documentId = documentId;
  }

  if (day) {
    // Combine day filter with existing filters using AND logic
    // Include both day-based tasks matching the day AND date-based tasks (day is null)
    const dayCondition = {
      OR: [
        { day: day }, // Include day-based tasks
        { day: null }, // Include date-based tasks (day is null)
      ],
    };

    // Merge with existing where conditions
    if (Object.keys(where).length > 0) {
      where.AND = where.AND || [];
      where.AND.push(dayCondition);
    } else {
      Object.assign(where, dayCondition);
    }
  }

  if (date) {
    where.date = date;
  }

  const primaryOrder = getSortOrder(req.validated.query, 'date');
  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [primaryOrder, { id: 'asc' }],
    take: limit + 1,
  });

  const hasMore = tasks.length > limit;
  const records = hasMore ? tasks.slice(0, limit) : tasks;
  const nextCursor =
    hasMore && records.length ? records[records.length - 1].date : null;

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Tasks retrieved successfully',
    data: {
      records,
      pageInfo: {
        cursor: cursor ? cursor : null,
        nextCursor,
        limit,
        hasMore,
      },
    },
  });
});

// ==========================================
// GET TASK BY ID
// ==========================================
export const getTaskById = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });

  if (!task) {
    throw new ApiError('Task not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Task retrieved successfully',
    data: task,
  });
});
