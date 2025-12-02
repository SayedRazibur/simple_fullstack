import express from 'express';

import {
  createOpenProduct,
  updateOpenProduct,
  deleteOpenProduct,
  getAllOpenProducts,
  getOpenProductById,
} from '../../controllers/operations/openProduct.controller.js';
import {
  createOpenProductSchema,
  updateOpenProductSchema,
  deleteOpenProductSchema,
  getAllOpenProductsSchema,
  getOpenProductByIdSchema,
} from '../../validators/operations/openProduct.validator.js';
import { validate } from '../../middlewares/zod.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, validate(createOpenProductSchema), createOpenProduct);

router.put(
  '/:id',
  protect,
  validate(updateOpenProductSchema),
  updateOpenProduct
);

router.delete(
  '/:id',
  protect,
  validate(deleteOpenProductSchema),
  deleteOpenProduct
);

router.get(
  '/',
  protect,
  validate(getAllOpenProductsSchema),
  getAllOpenProducts
);

router.get(
  '/:id',
  protect,
  validate(getOpenProductByIdSchema),
  getOpenProductById
);

export default router;
