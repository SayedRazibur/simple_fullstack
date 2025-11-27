import express from 'express';
import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  createSupplierSchema,
  deleteSupplierSchema,
  getAllSuppliersSchema,
  updateSupplierSchema,
} from '../../validators/operations/supplier.validator.js';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
} from '../../controllers/operations/supplier.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', protect, validate(createSupplierSchema), createSupplier);
router.put(
  '/:id',
  protect,
  isAdmin,
  validate(updateSupplierSchema),
  updateSupplier
);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteSupplierSchema),
  deleteSupplier
);
router.get('/', protect, validate(getAllSuppliersSchema), getAllSuppliers);

export default router;
