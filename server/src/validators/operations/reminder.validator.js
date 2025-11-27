import { z } from 'zod';

const stringRequired = (max = 300) => z.string().min(1).max(max);
const stringOptional = (max = 300) => z.string().max(max).optional();
const commentSchema = z.string().nullable().optional();
const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date format');
const optionalIsoDateString = isoDateString.optional();
const positiveInt = z.coerce.number().int().positive();
const idArraySchema = z.array(positiveInt).optional();

export const createReminderSchema = z.object({
  body: z.object({
    title: stringRequired(300),
    comment: commentSchema,
    date: isoDateString,
    entityIds: idArraySchema,
    documentIds: idArraySchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateReminderSchema = z.object({
  body: z.object({
    title: stringOptional(300),
    comment: commentSchema,
    date: optionalIsoDateString,
    entityIds: idArraySchema,
    documentIds: idArraySchema,
  }),
  params: z.object({
    id: positiveInt,
  }),
  query: z.object({}),
});

export const deleteReminderSchema = z.object({
  params: z.object({
    id: positiveInt,
  }),
});

export const getReminderByIdSchema = z.object({
  params: z.object({
    id: positiveInt,
  }),
});

export const getAllRemindersSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(15),
    search: z.string().optional(),
    sortBy: z.enum(['date', 'title', 'id']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    cursor: optionalIsoDateString,
    entityId: positiveInt.optional(),
    documentId: positiveInt.optional(),
  }),
});
