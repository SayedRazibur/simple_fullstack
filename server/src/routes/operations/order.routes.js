import express from 'express';
import { protect, isAdmin } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  createOrderSchema,
  updateOrderSchema,
  deleteOrderSchema,
  getAllOrdersSchema,
} from '../../validators/operations/order.validator.js';
import {
  createOrder,
  updateOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} from '../../controllers/operations/order.controller.js';

const router = express.Router();

router.post('/', protect, validate(createOrderSchema), createOrder);
router.put('/:id', protect, validate(updateOrderSchema), updateOrder);
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(deleteOrderSchema),
  deleteOrder
);
router.get('/', protect, validate(getAllOrdersSchema), getAllOrders);
router.get('/:id', protect, validate(deleteOrderSchema), getOrderById);

export default router;
