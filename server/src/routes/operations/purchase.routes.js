import express from 'express';
import { protect, isAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  deletePurchaseSchema,
  getAllPurchasesSchema,
} from '../../validators/operations/purchase.validator.js';
import {
  createPurchase,
  updatePurchase,
  deletePurchase,
  getAllPurchases,
  getPurchaseById,
} from '../../controllers/operations/purchase.controller.js';

const router = express.Router();

router.post('/', protect, validate(createPurchaseSchema), createPurchase);
router.put('/:id', protect, validate(updatePurchaseSchema), updatePurchase);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deletePurchaseSchema),
  deletePurchase
);
router.get('/', protect, validate(getAllPurchasesSchema), getAllPurchases);
router.get('/:id', protect, validate(deletePurchaseSchema), getPurchaseById);

export default router;
