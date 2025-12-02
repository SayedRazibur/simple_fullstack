import express from 'express';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  createRefill,
  deleteRefill,
  updateRefill,
} from '../../controllers/operations/refill.controller.js';
import {
  createRefillSchema,
  deleteRefillSchema,
  updateRefillSchema,
} from '../../validators/operations/refill.validator.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, validate(createRefillSchema), createRefill);

router.delete('/:id', protect, validate(deleteRefillSchema), deleteRefill);

router.put('/:id', protect, validate(updateRefillSchema), updateRefill);

export default router;
