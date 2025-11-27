import { z } from 'zod';

// Common field schemas
const stringRequired = (max = 255) => z.string().max(max);
const stringOptional = (max = 255) => z.string().max(max).optional();

// Create Document
export const createDocumentSchema = z.object({
  body: z.object({
    title: stringRequired(255),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Update Document
export const updateDocumentSchema = z.object({
  body: z.object({
    title: stringOptional(255),
  }),
  params: z.object({
    id: z.coerce.number({ required_error: 'Document ID is required' }),
  }),
  query: z.object({}),
});

// Delete Document
export const deleteDocumentSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Document ID is required' }),
  }),
});

// Get All Documents (pagination + filters)
export const getAllDocumentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: z.enum(['title', 'importedOn']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// Get Document By ID
export const getDocumentByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number({ required_error: 'Document ID is required' }),
  }),
});

// Send Document To Clients
export const sendDocumentToClientSchema = z.object({
  body: z.object({
    documentId: z.number({ required_error: 'Document ID is required' }),
    clientIds: z.array(z.number()).min(1, 'At least one client ID is required'),
  }),
  params: z.object({}),
  query: z.object({}),
});
