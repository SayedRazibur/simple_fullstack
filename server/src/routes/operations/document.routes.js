import express from 'express';
import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import { documentUpload } from '../../middlewares/multer.middleware.js';
import {
  createDocumentSchema,
  deleteDocumentSchema,
  getAllDocumentsSchema,
  getDocumentByIdSchema,
  updateDocumentSchema,
  sendDocumentToClientSchema,
} from '../../validators/operations/document.validator.js';
import {
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  sendDocumentToClient,
} from '../../controllers/operations/document.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';

const router = express.Router();

// Protected routes
router.post(
  '/',
  protect,
  documentUpload.array('files', 10),
  validate(createDocumentSchema),
  createDocument
);
router.get('/', protect, validate(getAllDocumentsSchema), getAllDocuments);
router.get('/:id', protect, validate(getDocumentByIdSchema), getDocumentById);
router.put(
  '/:id',
  protect,
  isAdmin,
  validate(updateDocumentSchema),
  updateDocument
);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteDocumentSchema),
  deleteDocument
);

router.post(
  '/send-to-clients',
  protect,
  validate(sendDocumentToClientSchema),
  sendDocumentToClient
);

export default router;
