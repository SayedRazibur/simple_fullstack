import express from 'express';
import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  createClientSchema,
  deleteClientSchema,
  getAllClientsSchema,
  updateClientSchema,
} from '../../validators/operations/client.validator.js';
import {
  createClient,
  deleteClient,
  getAllClients,
  updateClient,
} from '../../controllers/operations/client.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', protect, validate(createClientSchema), createClient);
router.put(
  '/:id',
  protect,
  isAdmin,
  validate(updateClientSchema),
  updateClient
);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteClientSchema),
  deleteClient
);
router.get('/', protect, validate(getAllClientsSchema), getAllClients);

export default router;
