import { z } from 'zod';

const dateCoerce = () => z.coerce.date();
const dayEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

export const createPurchaseSchema = z.object({
  body: z.object({
    pickupId: z.coerce.number(),
    supplierId: z.coerce.number(),
    date: dateCoerce().optional(),
    day: dayEnum.optional(),
    items: z
      .array(
        z.object({
          productId: z.coerce.number(),
          quantity: z.coerce.number(),
        })
      )
      .optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updatePurchaseSchema = z.object({
  body: z.object({
    pickupId: z.coerce.number().optional(),
    supplierId: z.coerce.number().optional(),
    date: dateCoerce().optional(),
    day: dayEnum.optional(),
    items: z
      .array(
        z.object({
          id: z.coerce.number().optional(),
          productId: z.coerce.number().optional(),
          quantity: z.coerce.number().optional(),
        })
      )
      .optional(),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Purchase ID is required' }),
  }),
  query: z.object({}),
});

export const deletePurchaseSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Purchase ID is required' }),
  }),
});

export const getAllPurchasesSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    page: z.coerce.number().min(1).default(1),
    pickupId: z.coerce.number().optional(),
    supplierId: z.coerce.number().optional(),
    day: dayEnum.optional(),
    date: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['date', 'pickup', 'supplier']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
