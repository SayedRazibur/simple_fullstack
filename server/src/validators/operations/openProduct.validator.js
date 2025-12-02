import { z } from 'zod';

export const createOpenProductSchema = z.object({
  body: z.object({
    siteId: z.number().int().positive('Site ID must be a positive integer'),
    documentId: z
      .number()
      .int()
      .positive('Document ID must be a positive integer'),
    products: z
      .array(
        z.object({
          productId: z
            .number()
            .int()
            .positive('Product ID must be a positive integer'),
        })
      )
      .min(1, 'At least one product is required'),
  }),
});

export const updateOpenProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    siteId: z
      .number()
      .int()
      .positive('Site ID must be a positive integer')
      .optional(),
    documentId: z
      .number()
      .int()
      .positive('Document ID must be a positive integer')
      .optional(),
    products: z
      .array(
        z.object({
          productId: z
            .number()
            .int()
            .positive('Product ID must be a positive integer'),
        })
      )
      .min(1, 'At least one product is required')
      .optional(),
  }),
});

export const deleteOpenProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const getAllOpenProductsSchema = z.object({
  query: z.object({
    siteId: z.coerce.number().int().positive().optional(),
    date: z.string().optional(),
  }),
});

export const getOpenProductByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
