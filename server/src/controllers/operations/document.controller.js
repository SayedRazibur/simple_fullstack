import { StatusCodes } from 'http-status-codes';

import ApiError from '../../utils/api.error.js';
import catchAsync from '../../utils/catch.async.js';
import {
  combineFilters,
  getDateFilter,
  getSearchFilters,
} from '../../utils/filter.js';
import { getOffsetPagination } from '../../utils/pagination.js';
import { getSortOrder } from '../../utils/sort.js';
import successResponse from '../../utils/success.response.js';
import {
  uploadToCloudinary,
  deleteFileFromCloudinary,
} from '../../services/upload_cloudinary.service.js';
import prisma from '../../config/prisma.js';
import { emailHelper } from '../../utils/email.helper.js';
import { documentEmailTemplate } from '../../services/email_template.service.js';

// ==========================================
// CREATE DOCUMENT
// ==========================================
export const createDocument = catchAsync(async (req, res) => {
  const { title } = req.body;
  const files = req.files || [];

  if (!files || files.length === 0) {
    throw new ApiError(
      'At least one file is required',
      StatusCodes.BAD_REQUEST
    );
  }

  // Upload all files to Cloudinary
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, file.originalname, 'documents')
  );

  const uploadResults = await Promise.all(uploadPromises);

  const links = uploadResults.map((result) => result.secure_url);

  const document = await prisma.document.create({
    data: {
      title,
      links,
    },
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    message: 'Document created successfully',
    data: document,
  });
});

// ==========================================
// UPDATE DOCUMENT (TITLE ONLY)
// ==========================================
export const updateDocument = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const { title } = req.body;

  const existing = await prisma.document.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!existing) {
    throw new ApiError('Document not found', StatusCodes.NOT_FOUND);
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new ApiError(
      'Title is required and cannot be empty',
      StatusCodes.BAD_REQUEST
    );
  }

  const trimmedTitle = title.trim();

  const updated = await prisma.document.update({
    where: { id },
    data: { title: trimmedTitle },
    select: {
      id: true,
      title: true,
      links: true,
      importedOn: true,
    },
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Document title updated successfully',
    data: updated,
  });
});

// ==========================================
// DELETE DOCUMENT
// ==========================================
export const deleteDocument = catchAsync(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Document not found', StatusCodes.NOT_FOUND);
  }

  // Delete all files from Cloudinary
  if (existing.links && existing.links.length > 0) {
    const deletePromises = existing.links.map((url) =>
      deleteFileFromCloudinary(url).catch((error) => {
        console.error('Error deleting file from Cloudinary:', error);
      })
    );
    await Promise.allSettled(deletePromises);
  }

  await prisma.document.delete({ where: { id } });

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Document deleted successfully',
    data: null,
  });
});

// ==========================================
// GET ALL DOCUMENTS
// ==========================================
export const getAllDocuments = catchAsync(async (req, res) => {
  const { skip, limit, page } = getOffsetPagination(req.query);

  const searchFilters = getSearchFilters(req.query, ['title']);
  const dateFilters = getDateFilter(req.query, 'importedOn');
  const combined = combineFilters(searchFilters, dateFilters);
  const orderBy = getSortOrder(req.query, 'importedOn');

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where: combined,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.document.count({ where: combined }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const nextPage = page * limit < total ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Documents retrieved successfully',
    data: {
      records: documents,
      pagination: {
        total_records: total,
        current_page: page,
        total_pages: totalPages,
        limit,
        next_page: nextPage,
        prev_page: prevPage,
      },
    },
  });
});

// ==========================================
// GET DOCUMENT BY ID
// ==========================================
export const getDocumentById = catchAsync(async (req, res) => {
  const id = Number(req.params.id);

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    throw new ApiError('Document not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    message: 'Document retrieved successfully',
    data: document,
  });
});

// ==========================================
// SEND DOCUMENT TO CLIENTS
// ==========================================
export const sendDocumentToClient = catchAsync(async (req, res) => {
  const { documentId, clientIds } = req.body;

  // Validate document exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    throw new ApiError('Document not found', StatusCodes.NOT_FOUND);
  }

  // Validate clients exist and get their details
  const clients = await prisma.client.findMany({
    where: {
      id: { in: clientIds },
    },
  });

  if (clients.length !== clientIds.length) {
    throw new ApiError('One or more clients not found', StatusCodes.NOT_FOUND);
  }

  // Filter clients with email addresses
  const clientsWithEmail = clients.filter((client) => client.email);

  if (clientsWithEmail.length === 0) {
    throw new ApiError(
      'None of the selected clients have email addresses',
      StatusCodes.BAD_REQUEST
    );
  }

  // Send emails to all clients with email addresses
  const emailPromises = clientsWithEmail.map((client) => {
    const clientName = `${client.firstName} ${client.surname || ''}`.trim();
    const emailHtml = documentEmailTemplate({
      name: clientName,
      documentTitle: document.title,
      documentLinks: document.links || [],
    });

    return emailHelper({
      to: client.email,
      subject: `Document Shared: ${document.title}`,
      html: emailHtml,
    }).catch((error) => {
      console.error(`Failed to send email to ${client.email}:`, error);
      return { error: true, email: client.email, clientId: client.id };
    });
  });

  const emailResults = await Promise.allSettled(emailPromises);

  // Count successful and failed emails
  const successful = emailResults.filter(
    (result) => result.status === 'fulfilled' && !result.value?.error
  ).length;
  const failed = emailResults.filter(
    (result) =>
      result.status === 'rejected' ||
      (result.status === 'fulfilled' && result.value?.error)
  ).length;

  // Get failed client IDs
  const failedClientIds = emailResults
    .filter(
      (result) =>
        result.status === 'rejected' ||
        (result.status === 'fulfilled' && result.value?.error)
    )
    .map((result) => {
      if (result.status === 'fulfilled' && result.value?.clientId) {
        return result.value.clientId;
      }
      return null;
    })
    .filter((id) => id !== null);

  successResponse({
    res,
    code: StatusCodes.OK,
    message: `Document sent successfully to ${successful} client(s)${
      failed > 0 ? `, ${failed} failed` : ''
    }`,
    data: {
      documentId,
      totalClients: clientIds.length,
      clientsWithEmail: clientsWithEmail.length,
      successful,
      failed,
      failedClientIds: failedClientIds.length > 0 ? failedClientIds : undefined,
      sentAt: new Date().toISOString(),
    },
  });
});
