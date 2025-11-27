import { z } from 'zod';

const stringOptional = (max = 250) => z.string().max(max).optional();
const stringRequired = (max = 250) => z.string().max(max);
const positiveInt = z.coerce.number().int().positive();
const idArraySchema = z.array(positiveInt).optional();

// Batch schema used inside product
const productBatchSchema = z.object({
  id: z.coerce.number().optional(),
  quantity: z.coerce.number(),
  dlc: z.coerce.date(),
  deliveryTemp: z.coerce.number(),
  unitId: z.coerce.number(),
  supplierId: z.coerce.number(),
});

// Create Product (with optional batches)
export const createProductSchema = z.object({
  body: z.object({
    plu: z.coerce.number(),
    name: stringRequired(255),
    productType: stringRequired(255),
    departmentId: z.coerce.number(),
    criticalQuantity: z.coerce.number(),
    restock: z.boolean().optional(),
    batches: z.array(productBatchSchema).optional(),
    documentIds: idArraySchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Product (with optional batches array to create/update)
export const updateProductSchema = z.object({
  body: z.object({
    plu: z.coerce.number().optional(),
    name: stringOptional(255),
    productType: stringOptional(255),
    departmentId: z.coerce.number().optional(),
    criticalQuantity: z.coerce.number().optional(),
    restock: z.boolean().optional(),
    batches: z.array(productBatchSchema).optional(),
    documentIds: idArraySchema,
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Product ID is required' }),
  }),
  query: z.object({}),
});

// Delete Product
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Product ID is required' }),
  }),
});

// Get All Products (pagination + filters)
export const getAllProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    supplierId: z.coerce.number().optional(),
    sortBy: z.enum(['name', 'productType', 'createdAt', 'restock']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// ProductBatch specific schemas
export const createProductBatchSchema = z.object({
  body: z.object({
    quantity: z.coerce.number(),
    dlc: z.coerce.date(),
    deliveryTemp: z.coerce.number(),
    productId: z.coerce.number(),
    unitId: z.coerce.number(),
    supplierId: z.coerce.number(),
  }),
});

export const updateProductBatchSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().optional(),
    dlc: z.coerce.date().optional(),
    deliveryTemp: z.coerce.number().optional(),
    unitId: z.coerce.number().optional(),
    supplierId: z.coerce.number().optional(),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'ProductBatch ID is required' }),
  }),
});

export const deleteProductBatchSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'ProductBatch ID is required' }),
  }),
});
