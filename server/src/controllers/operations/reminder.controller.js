import { StatusCodes } from 'http-status-codes';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import { getSearchFilters } from '../../utils/filter.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';

const reminderInclude = {
  entities: {
    select: {
      id: true,
      name: true,
    },
  },
  documents: {
    select: {
      id: true,
      title: true,
      links: true,
    },
  },
};

// ==========================================
// CREATE REMINDER
// ==========================================
export const createReminder = catchAsync(async (req, res) => {
  const { title, comment, date, entityIds, documentIds } = req.validated.body;

  const data = {
    title,
    date: date,
    ...(comment !== undefined && { comment }),
  };

  if (entityIds && entityIds.length) {
    data.entities = {
      connect: entityIds.map((id) => ({ id })),
    };
  }

  if (documentIds && documentIds.length) {
    data.documents = {
      connect: documentIds.map((id) => ({ id })),
    };
  }

  const reminder = await prisma.reminder.create({
    data,
    include: reminderInclude,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Reminder created successfully',
    data: reminder,
  });
});

// ==========================================
// UPDATE REMINDER
// ==========================================
export const updateReminder = catchAsync(async (req, res) => {
  const id = req.validated.params.id;
  const { title, comment, date, entityIds, documentIds } = req.validated.body;

  const existing = await prisma.reminder.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Reminder not found', StatusCodes.NOT_FOUND);
  }

  const data = {};

  if (title !== undefined) data.title = title;
  if (comment !== undefined) data.comment = comment;
  if (date !== undefined) data.date = date;

  if (entityIds !== undefined) {
    data.entities = {
      set: entityIds.map((entityId) => ({ id: entityId })),
    };
  }

  if (documentIds !== undefined) {
    data.documents = {
      set: documentIds.map((documentId) => ({ id: documentId })),
    };
  }

  const updatedReminder = await prisma.reminder.update({
    where: { id },
    data,
    include: reminderInclude,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Reminder updated successfully',
    data: updatedReminder,
  });
});

// ==========================================
// DELETE REMINDER
// ==========================================
export const deleteReminder = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const existing = await prisma.reminder.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Reminder not found', StatusCodes.NOT_FOUND);
  }

  await prisma.reminder.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Reminder deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL REMINDERS (cursor-based pagination)
// ==========================================
export const getAllReminders = catchAsync(async (req, res) => {
  const { limit, cursor, entityId, documentId } = req.validated.query;

  const where = getSearchFilters(req.validated.query, ['title', 'comment']);

  if (cursor) {
    where.date = { gt: cursor };
  }

  if (entityId) {
    where.entities = { some: { id: entityId } };
  }

  if (documentId) {
    where.documents = { some: { id: documentId } };
  }

  const primaryOrder = getSortOrder(req.validated.query, 'date');
  const reminders = await prisma.reminder.findMany({
    where,
    include: reminderInclude,
    orderBy: [primaryOrder, { id: 'asc' }],
    take: limit + 1,
  });

  const hasMore = reminders.length > limit;
  const records = hasMore ? reminders.slice(0, limit) : reminders;
  const nextCursor =
    hasMore && records.length ? records[records.length - 1].date : null;

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Reminders retrieved successfully',
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
// GET REMINDER BY ID
// ==========================================
export const getReminderById = catchAsync(async (req, res) => {
  const id = req.validated.params.id;

  const reminder = await prisma.reminder.findUnique({
    where: { id },
    include: reminderInclude,
  });

  if (!reminder) {
    throw new ApiError('Reminder not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Reminder retrieved successfully',
    data: reminder,
  });
});
