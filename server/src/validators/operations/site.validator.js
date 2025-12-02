import { z } from 'zod';

const dayEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

export const createSiteSchema = z.object({
  body: z.object({
    siteName: z.string().min(1, 'Site name is required'),
    day: dayEnum,
    supervisor: z.string().min(1, 'Supervisor is required'),
  }),
});

export const updateSiteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    siteName: z.string().min(1).optional(),
    day: dayEnum.optional(),
    supervisor: z.string().min(1).optional(),
  }),
});

export const getAllSitesSchema = z.object({
  query: z.object({
    day: dayEnum.optional(),
    supervisor: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const getSiteByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const deleteSiteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
