import { z } from 'zod';

// Common field schemas
const emailSchema = z.string().email('Invalid email address').optional();
const stringOptional = (max = 250) => z.string().max(max).optional();
const stringRequired = (max = 250) => z.string().max(max);

// Create Supplier
export const createSupplierSchema = z.object({
  body: z.object({
    name: stringRequired(255),
    email: emailSchema,
    phone: stringOptional(50),
    contactMethod: stringOptional(100),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Supplier
export const updateSupplierSchema = z.object({
  body: z.object({
    name: stringOptional(255),
    email: emailSchema,
    phone: stringOptional(50),
    contactMethod: stringOptional(100),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Supplier ID is required' }),
  }),
  query: z.object({}),
});

// Delete Supplier
export const deleteSupplierSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Supplier ID is required' }),
  }),
});

// Get All Suppliers (pagination + filters)
export const getAllSuppliersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'email', 'phone', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
