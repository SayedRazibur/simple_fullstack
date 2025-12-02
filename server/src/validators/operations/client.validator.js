import { z } from 'zod';

// Common field schemas
const emailSchema = z.string().email('Invalid email address');
const stringOptional = (max = 250) => z.string().max(max).optional();
const stringRequired = (max = 250) => z.string().max(max);

// Create Client
export const createClientSchema = z.object({
  body: z.object({
    firstName: stringRequired(250),
    surname: stringOptional(250),
    address: stringOptional(400),
    email: emailSchema.optional().or(z.literal('')),
    phone: stringOptional(250),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Client
export const updateClientSchema = z.object({
  body: z.object({
    firstName: stringOptional(250),
    surname: stringOptional(250),
    address: stringOptional(400),
    email: emailSchema.optional(),
    phone: stringOptional(250),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Client ID is required' }),
  }),
  query: z.object({}),
});

// Delete Client
export const deleteClientSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Client ID is required' }),
  }),
});

// Get All Clients (pagination + filters)
export const getAllClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: z.enum(['firstName', 'surname', 'email', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
