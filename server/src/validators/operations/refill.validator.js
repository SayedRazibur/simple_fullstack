import { z } from 'zod';

export const createRefillSchema = z.object({
  body: z.object({
    siteId: z.number().int().positive(),
    refills: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, 'At least one refill is required'),
  }),
});

export const updateRefillSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  }),
});

export const deleteRefillSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
