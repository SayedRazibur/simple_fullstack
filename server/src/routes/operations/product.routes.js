import express from 'express';
import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  createProductSchema,
  deleteProductSchema,
  getAllProductsSchema,
  updateProductSchema,
} from '../../validators/operations/product.validator.js';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../../controllers/operations/product.controller.js';
import { validate } from '../../middlewares/zod.middleware.js';

const router = express.Router();

// Product routes
router.post('/', protect, validate(createProductSchema), createProduct);
router.put('/:id', protect, validate(updateProductSchema), updateProduct);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteProductSchema),
  deleteProduct
);
router.get('/', protect, validate(getAllProductsSchema), getAllProducts);
router.get('/:id', protect, getProduct);

export default router;
