import { z } from 'zod';

const stringRequired = (max = 300) => z.string().min(1).max(max);
const stringOptional = (max = 300) => z.string().max(max).optional();
const commentSchema = z.string().nullable().optional();
const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date format');
const optionalIsoDateString = isoDateString.optional();
const positiveInt = z.coerce.number().int().positive();
const positiveFloat = z.coerce.number().positive();
const dayEnum = z
  .enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
  .optional();

export const createTaskSchema = z.object({
  body: z.object({
    title: stringRequired(300),
    comment: commentSchema,
    quantity: positiveFloat,
    day: dayEnum,
    date: optionalIsoDateString,
    productId: positiveInt.optional(),
    orderId: positiveInt.optional(),
    entityId: positiveInt.optional(),
    documentId: positiveInt.optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: stringOptional(300),
    comment: commentSchema,
    quantity: positiveFloat.optional(),
    day: dayEnum,
    date: optionalIsoDateString,
    productId: positiveInt.optional().nullable(),
    orderId: positiveInt.optional().nullable(),
    entityId: positiveInt.optional().nullable(),
    documentId: positiveInt.optional().nullable(),
  }),
  params: z.object({
    id: positiveInt,
  }),
  query: z.object({}),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: positiveInt,
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    id: positiveInt,
  }),
});

export const getAllTasksSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(15),
    search: z.string().optional(),
    sortBy: z.enum(['date', 'title', 'id', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    cursor: optionalIsoDateString,
    entityId: positiveInt.optional(),
    productId: positiveInt.optional(),
    orderId: positiveInt.optional(),
    documentId: positiveInt.optional(),
    day: dayEnum,
    date: optionalIsoDateString,
  }),
});
