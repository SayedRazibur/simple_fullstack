import { z } from 'zod';

const dateCoerce = () => z.coerce.date();

export const createOrderSchema = z.object({
  body: z.object({
    clientId: z.coerce.number(),
    orderTypeId: z.coerce.number(),
    pickupId: z.coerce.number(),
    date: dateCoerce(),
    comment: z.string().optional(),
    bill: z.boolean().optional(),
    items: z
      .array(
        z.object({
          id: z.coerce.number().optional(),
          productId: z.coerce.number(),
          quantity: z.coerce.number(),
        })
      )
      .optional(),
    services: z.array(z.coerce.number()).optional(),
    documentIds: z.array(z.coerce.number()).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateOrderSchema = z.object({
  body: z.object({
    clientId: z.coerce.number().optional(),
    orderTypeId: z.coerce.number().optional(),
    pickupId: z.coerce.number().optional(),
    date: dateCoerce().optional(),
    comment: z.string().optional(),
    bill: z.boolean().optional(),
    items: z
      .array(
        z.object({
          id: z.coerce.number().optional(),
          productId: z.coerce.number().optional(),
          quantity: z.coerce.number().optional(),
        })
      )
      .optional(),
    services: z.array(z.coerce.number()).optional(),
    documentIds: z.array(z.coerce.number()).optional(),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Order ID is required' }),
  }),
  query: z.object({}),
});

export const deleteOrderSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Order ID is required' }),
  }),
});

export const getAllOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    pickupId: z.coerce.number().optional(),
    orderTypeId: z.coerce.number().optional(),
    serviceId: z.coerce.number().optional(),
    clientId: z.coerce.number().optional(),
    search: z.string().optional(),
    date: z.string().optional(),
  }),
});
